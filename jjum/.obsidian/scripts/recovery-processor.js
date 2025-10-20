const WorkQueueManager = require('./queue-manager');
const ProcessingManifest = require('./processing-manifest');
const CompletionLog = require('./completion-log');
const MainProcessor = require('./main-processor');
const fs = require('fs');
const path = require('path');

/**
 * Recovery Processor
 * Handles recovery of failed processing tasks with intelligent retry logic:
 * - Detects failed tasks from Processing Manifest
 * - Tracks last successful checkpoint for each task
 * - Resumes from checkpoint rather than starting over
 * - Prevents infinite retry loops with configurable limits
 * - Maintains detailed recovery logs
 */
class RecoveryProcessor {
  constructor(vaultPath, options = {}) {
    this.vaultPath = vaultPath || process.cwd();
    this.queueManager = new WorkQueueManager(this.vaultPath);
    this.manifest = new ProcessingManifest(this.vaultPath);
    this.completionLog = new CompletionLog(this.vaultPath);
    this.mainProcessor = new MainProcessor(this.vaultPath);

    // Configuration options
    this.options = {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 2000, // 2 seconds
      exponentialBackoff: options.exponentialBackoff !== false, // default true
      cleanupOldFailures: options.cleanupOldFailures !== false, // default true
      maxFailureAge: options.maxFailureAge || 86400000, // 24 hours in ms
      ...options
    };

    // Recovery state file path
    this.recoveryStatePath = path.join(this.vaultPath, '.obsidian/state/recovery-state.json');

    // Statistics
    this.stats = {
      startTime: null,
      endTime: null,
      failuresFound: 0,
      recovered: 0,
      permanentFailures: 0,
      skipped: 0,
      errors: [],
      recoveryDetails: []
    };
  }

  /**
   * Detect all failed tasks from Processing Manifest
   */
  async detectFailedTasks() {
    console.log('🔍 Detecting failed tasks...\n');

    const allProcessing = await this.manifest.getAll();

    const failedTasks = allProcessing.filter(item => {
      // Check if any agent in pipeline has failed
      const hasFailedAgent = item.agent_pipeline.some(a => a.status === 'failed');

      // Check retry count
      const hasExceededRetries = item.retry_count >= this.options.maxRetries;

      return hasFailedAgent || hasExceededRetries;
    });

    console.log(`   Found ${failedTasks.length} failed task(s)`);

    // Filter by age if cleanup is enabled
    if (this.options.cleanupOldFailures) {
      const now = Date.now();
      const recentFailures = failedTasks.filter(task => {
        const taskAge = now - new Date(task.started_at).getTime();
        return taskAge <= this.options.maxFailureAge;
      });

      const removed = failedTasks.length - recentFailures.length;
      if (removed > 0) {
        console.log(`   Filtered out ${removed} old failure(s) (older than ${this.options.maxFailureAge / 3600000}h)`);
      }

      return recentFailures;
    }

    return failedTasks;
  }

  /**
   * Find last successful checkpoint for a task
   */
  findLastCheckpoint(task) {
    // Find the last successfully completed agent
    const completedAgents = task.agent_pipeline.filter(a => a.status === 'completed');

    if (completedAgents.length === 0) {
      return {
        checkpoint: 'start',
        lastCompletedAgent: null,
        resumeFromAgent: task.agent_pipeline[0]?.name || null
      };
    }

    const lastCompleted = completedAgents[completedAgents.length - 1];
    const lastCompletedIndex = task.agent_pipeline.findIndex(a => a.name === lastCompleted.name);
    const resumeFrom = task.agent_pipeline[lastCompletedIndex + 1] || null;

    return {
      checkpoint: lastCompleted.name,
      lastCompletedAgent: lastCompleted,
      resumeFromAgent: resumeFrom?.name || null,
      resumeFromIndex: lastCompletedIndex + 1
    };
  }

  /**
   * Get retry count for a specific task from recovery state
   */
  async getRetryCount(workId) {
    const state = await this.loadRecoveryState();
    return state.retries[workId] || 0;
  }

  /**
   * Increment retry count for a task
   */
  async incrementRetryCount(workId) {
    const state = await this.loadRecoveryState();
    state.retries[workId] = (state.retries[workId] || 0) + 1;
    state.lastRetry[workId] = new Date().toISOString();
    await this.saveRecoveryState(state);
    return state.retries[workId];
  }

  /**
   * Check if task has exceeded retry limit
   */
  async hasExceededRetryLimit(workId) {
    const retryCount = await this.getRetryCount(workId);
    return retryCount >= this.options.maxRetries;
  }

  /**
   * Load recovery state from file
   */
  async loadRecoveryState() {
    try {
      if (fs.existsSync(this.recoveryStatePath)) {
        const data = await fs.promises.readFile(this.recoveryStatePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`⚠️  Could not load recovery state: ${error.message}`);
    }

    // Return default state
    return {
      retries: {},
      lastRetry: {},
      permanentFailures: []
    };
  }

  /**
   * Save recovery state to file
   */
  async saveRecoveryState(state) {
    try {
      await fs.promises.writeFile(
        this.recoveryStatePath,
        JSON.stringify(state, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`⚠️  Could not save recovery state: ${error.message}`);
    }
  }

  /**
   * Mark a task as permanently failed
   */
  async markPermanentFailure(workId, reason) {
    const state = await this.loadRecoveryState();

    if (!state.permanentFailures.includes(workId)) {
      state.permanentFailures.push(workId);
      await this.saveRecoveryState(state);
    }

    console.log(`   🚫 Marked as permanent failure: ${workId}`);
    console.log(`      Reason: ${reason}`);

    // Remove from processing manifest
    await this.manifest.remove(workId);
  }

  /**
   * Retry a single failed task
   */
  async retryTask(task) {
    const workId = task.work_id;

    console.log(`\n🔄 Attempting recovery: ${task.file_path}`);
    console.log(`   Work ID: ${workId}`);

    // Check if already exceeded retry limit
    if (await this.hasExceededRetryLimit(workId)) {
      console.log(`   ⚠️  Already exceeded retry limit (${this.options.maxRetries})`);
      await this.markPermanentFailure(workId, 'Exceeded maximum retry attempts');
      this.stats.permanentFailures++;
      return { status: 'permanent_failure', workId };
    }

    // Find checkpoint
    const checkpoint = this.findLastCheckpoint(task);
    console.log(`   Last checkpoint: ${checkpoint.checkpoint}`);

    if (checkpoint.resumeFromAgent) {
      console.log(`   Resuming from: ${checkpoint.resumeFromAgent}`);
    } else {
      console.log(`   No remaining agents to execute`);
      this.stats.skipped++;
      return { status: 'skipped', workId, reason: 'No agents to resume' };
    }

    // Increment retry count
    const retryCount = await this.incrementRetryCount(workId);
    console.log(`   Retry attempt: ${retryCount}/${this.options.maxRetries}`);

    // Calculate delay with exponential backoff
    let delay = this.options.retryDelay;
    if (this.options.exponentialBackoff) {
      delay = this.options.retryDelay * Math.pow(2, retryCount - 1);
    }

    console.log(`   Waiting ${delay}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Get remaining agents to execute
    const remainingAgents = task.agent_pipeline
      .slice(checkpoint.resumeFromIndex)
      .map(a => a.name);

    // Reset failed agents to pending
    for (const agentName of remainingAgents) {
      const agent = task.agent_pipeline.find(a => a.name === agentName);
      if (agent && agent.status === 'failed') {
        await this.manifest.updateAgent(workId, agentName, 'pending');
      }
    }

    // Attempt recovery
    const startTime = Date.now();
    try {
      const retryWorkItem = {
        id: workId,
        file: { path: task.file_path },
        required_agents: remainingAgents
      };

      await this.mainProcessor.executeAgentPipeline(retryWorkItem);

      const duration = Date.now() - startTime;
      console.log(`   ✅ Recovery successful (${duration}ms)`);

      this.stats.recovered++;
      this.stats.recoveryDetails.push({
        work_id: workId,
        file: task.file_path,
        checkpoint: checkpoint.checkpoint,
        retry_count: retryCount,
        duration_ms: duration,
        status: 'recovered',
        timestamp: new Date().toISOString()
      });

      return { status: 'recovered', workId, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`   ❌ Recovery failed: ${error.message}`);

      this.stats.errors.push({
        work_id: workId,
        file: task.file_path,
        error: error.message,
        retry_count: retryCount,
        timestamp: new Date().toISOString()
      });

      // Check if we should mark as permanent failure
      if (retryCount >= this.options.maxRetries) {
        await this.markPermanentFailure(workId, `Failed after ${retryCount} retry attempts: ${error.message}`);
        this.stats.permanentFailures++;
        return { status: 'permanent_failure', workId, error: error.message };
      }

      return { status: 'failed', workId, error: error.message, retryCount };
    }
  }

  /**
   * Recover all failed tasks
   */
  async recoverAll() {
    console.log('🔧 Recovery Processor - Starting...\n');

    this.stats.startTime = Date.now();

    // Detect failed tasks
    const failedTasks = await this.detectFailedTasks();
    this.stats.failuresFound = failedTasks.length;

    if (failedTasks.length === 0) {
      console.log('✅ No failed tasks to recover\n');
      return this.generateReport();
    }

    console.log(`\n📋 Processing ${failedTasks.length} failed task(s)...\n`);

    // Process each failed task
    for (const task of failedTasks) {
      await this.retryTask(task);
    }

    this.stats.endTime = Date.now();

    // Generate and display report
    const report = this.generateReport();
    this.displayReport(report);

    return report;
  }

  /**
   * Clean up recovery state for completed tasks
   */
  async cleanup() {
    console.log('🧹 Cleaning up recovery state...\n');

    const state = await this.loadRecoveryState();
    const processingItems = await this.manifest.getAll();
    const activeWorkIds = new Set(processingItems.map(item => item.work_id));

    // Remove retry counts for completed/removed tasks
    let cleaned = 0;
    for (const workId in state.retries) {
      if (!activeWorkIds.has(workId) && !state.permanentFailures.includes(workId)) {
        delete state.retries[workId];
        delete state.lastRetry[workId];
        cleaned++;
      }
    }

    await this.saveRecoveryState(state);

    console.log(`   Cleaned ${cleaned} completed task(s) from recovery state`);
    console.log(`   Permanent failures tracked: ${state.permanentFailures.length}\n`);

    return { cleaned, permanentFailures: state.permanentFailures.length };
  }

  /**
   * Generate recovery report
   */
  generateReport() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationSec = Math.floor(duration / 1000);

    const recoveryRate = this.stats.failuresFound > 0
      ? (this.stats.recovered / this.stats.failuresFound * 100).toFixed(1)
      : 0;

    return {
      summary: {
        failures_found: this.stats.failuresFound,
        recovered: this.stats.recovered,
        permanent_failures: this.stats.permanentFailures,
        skipped: this.stats.skipped,
        recovery_rate: `${recoveryRate}%`
      },
      timing: {
        start_time: new Date(this.stats.startTime).toISOString(),
        end_time: new Date(this.stats.endTime).toISOString(),
        total_duration_ms: duration,
        total_duration_sec: durationSec
      },
      recoveries: this.stats.recoveryDetails,
      errors: this.stats.errors,
      options: this.options
    };
  }

  /**
   * Display recovery report
   */
  displayReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 RECOVERY REPORT');
    console.log('='.repeat(60));

    console.log('\n📈 Summary:');
    console.log(`   Failures found: ${report.summary.failures_found}`);
    console.log(`   ✅ Recovered: ${report.summary.recovered}`);
    console.log(`   🚫 Permanent failures: ${report.summary.permanent_failures}`);
    if (report.summary.skipped > 0) {
      console.log(`   ⏭️  Skipped: ${report.summary.skipped}`);
    }
    console.log(`   Recovery rate: ${report.summary.recovery_rate}`);

    console.log('\n⏱️  Timing:');
    console.log(`   Total duration: ${report.timing.total_duration_sec}s`);

    if (report.recoveries.length > 0) {
      console.log('\n✅ Successful Recoveries:');
      report.recoveries.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec.file}`);
        console.log(`      Checkpoint: ${rec.checkpoint}`);
        console.log(`      Retry: ${rec.retry_count}`);
        console.log(`      Duration: ${rec.duration_ms}ms`);
      });
    }

    if (report.errors.length > 0) {
      console.log('\n❌ Failed Recoveries:');
      report.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.file}`);
        console.log(`      Error: ${err.error}`);
        console.log(`      Retry: ${err.retry_count}`);
        console.log(`      Time: ${err.timestamp}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('');
  }

  /**
   * Save report to file
   */
  async saveReport(report, outputPath) {
    if (!outputPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      outputPath = path.join(this.vaultPath, '.obsidian/state', `recovery-report-${timestamp}.json`);
    }

    await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`💾 Report saved to: ${outputPath}\n`);

    return outputPath;
  }
}

module.exports = RecoveryProcessor;

// CLI Interface
if (require.main === module) {
  const command = process.argv[2] || 'recover';
  const vaultPath = process.argv[3] || process.cwd();

  // Parse options
  const options = {
    maxRetries: parseInt(process.argv.find(arg => arg.startsWith('--max-retries='))?.split('=')[1]) || 3,
    retryDelay: parseInt(process.argv.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || 2000,
    exponentialBackoff: !process.argv.includes('--no-backoff'),
    cleanupOldFailures: !process.argv.includes('--keep-old')
  };

  const recoveryProcessor = new RecoveryProcessor(vaultPath, options);

  (async () => {
    try {
      switch (command) {
        case 'recover':
          const report = await recoveryProcessor.recoverAll();

          if (process.argv.includes('--save-report')) {
            await recoveryProcessor.saveReport(report);
          }

          process.exit(report.summary.permanent_failures > 0 ? 1 : 0);
          break;

        case 'cleanup':
          await recoveryProcessor.cleanup();
          break;

        case 'status': {
          const state = await recoveryProcessor.loadRecoveryState();
          console.log('🔧 Recovery State:\n');
          console.log('Active retries:', Object.keys(state.retries).length);
          console.log('Permanent failures:', state.permanentFailures.length);
          console.log('\nRetry counts:');
          for (const [workId, count] of Object.entries(state.retries)) {
            console.log(`   ${workId}: ${count}/${options.maxRetries}`);
          }
          break;
        }

        default:
          console.log('Usage: node recovery-processor.js [command] [vault-path] [options]');
          console.log('\nCommands:');
          console.log('  recover  - Recover all failed tasks (default)');
          console.log('  cleanup  - Clean up recovery state');
          console.log('  status   - Show recovery status');
          console.log('\nOptions:');
          console.log('  --max-retries=N    Maximum retry attempts (default: 3)');
          console.log('  --delay=N          Base retry delay in ms (default: 2000)');
          console.log('  --no-backoff       Disable exponential backoff');
          console.log('  --keep-old         Keep old failures (default: remove >24h)');
          console.log('  --save-report      Save report to file');
          break;
      }
    } catch (error) {
      console.error('❌ Fatal error in recovery processor:', error);
      process.exit(1);
    }
  })();
}
