const WorkQueueManager = require('./queue-manager');
const ProcessingManifest = require('./processing-manifest');
const CompletionLog = require('./completion-log');
const MainProcessor = require('./main-processor');
const fs = require('fs');
const path = require('path');

/**
 * Batch Processor
 * Processes multiple documents from the work queue with advanced features:
 * - Parallel processing support
 * - Progress tracking and logging
 * - Detailed completion reports
 * - Error handling and recovery
 */
class BatchProcessor {
  constructor(vaultPath, options = {}) {
    this.vaultPath = vaultPath || process.cwd();
    this.queueManager = new WorkQueueManager(this.vaultPath);
    this.manifest = new ProcessingManifest(this.vaultPath);
    this.completionLog = new CompletionLog(this.vaultPath);
    this.mainProcessor = new MainProcessor(this.vaultPath);

    // Configuration options
    this.options = {
      parallel: options.parallel || false,
      maxParallel: options.maxParallel || 3,
      delayBetweenItems: options.delayBetweenItems || 500,
      stopOnError: options.stopOnError || false,
      progressInterval: options.progressInterval || 5000, // 5 seconds
      ...options
    };

    // Statistics tracking
    this.stats = {
      startTime: null,
      endTime: null,
      totalItems: 0,
      processed: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      processingTimes: [],
      currentBatch: []
    };
  }

  /**
   * Process all items in the work queue
   */
  async processAll() {
    console.log('🚀 Batch Processor - Starting...\n');

    // Initialize
    this.stats.startTime = Date.now();
    const queueStats = await this.queueManager.getStats();
    this.stats.totalItems = queueStats.total_items;

    if (this.stats.totalItems === 0) {
      console.log('✅ Queue is empty - nothing to process\n');
      return this.generateReport();
    }

    console.log(`📊 Queue Overview:`);
    console.log(`   Total items: ${this.stats.totalItems}`);
    console.log(`   Processing mode: ${this.options.parallel ? `Parallel (max ${this.options.maxParallel})` : 'Sequential'}`);
    console.log(`   Stop on error: ${this.options.stopOnError ? 'Yes' : 'No'}`);
    console.log('');

    // Start progress logger
    const progressLogger = this.startProgressLogger();

    try {
      if (this.options.parallel) {
        await this.processParallel();
      } else {
        await this.processSequential();
      }
    } finally {
      // Stop progress logger
      clearInterval(progressLogger);
    }

    this.stats.endTime = Date.now();

    // Generate and display report
    const report = this.generateReport();
    this.displayReport(report);

    return report;
  }

  /**
   * Process queue sequentially (one at a time)
   */
  async processSequential() {
    console.log('⏩ Processing sequentially...\n');

    while (true) {
      const nextWork = await this.queueManager.getNext();

      if (!nextWork) {
        break; // Queue is empty
      }

      await this.processSingleItem(nextWork);

      // Delay between items (if configured)
      if (this.options.delayBetweenItems > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.delayBetweenItems));
      }

      // Stop on error if configured
      if (this.options.stopOnError && this.stats.failed > 0) {
        console.log('\n⚠️  Stopping batch due to error (stopOnError=true)\n');
        break;
      }
    }
  }

  /**
   * Process queue in parallel (multiple items at once)
   */
  async processParallel() {
    console.log(`⚡ Processing in parallel (max ${this.options.maxParallel} concurrent)...\n`);

    const activeTasks = new Set();

    while (true) {
      // Fill up to maxParallel concurrent tasks
      while (activeTasks.size < this.options.maxParallel) {
        const nextWork = await this.queueManager.getNext();

        if (!nextWork) {
          break; // No more items in queue
        }

        // Start processing this item
        const task = this.processSingleItem(nextWork)
          .finally(() => {
            activeTasks.delete(task);
          });

        activeTasks.add(task);
      }

      // Wait for at least one task to complete
      if (activeTasks.size > 0) {
        await Promise.race(activeTasks);

        // Stop on error if configured
        if (this.options.stopOnError && this.stats.failed > 0) {
          console.log('\n⚠️  Stopping batch due to error (stopOnError=true)\n');
          // Wait for remaining tasks to complete
          await Promise.all(activeTasks);
          break;
        }
      } else {
        break; // No more tasks and queue is empty
      }
    }
  }

  /**
   * Process a single work item
   */
  async processSingleItem(workItem) {
    const startTime = Date.now();
    this.stats.currentBatch.push(workItem.id);

    try {
      console.log(`\n📄 Processing [${this.stats.processed + 1}/${this.stats.totalItems}]: ${workItem.file.path}`);

      // Use main processor to handle this item
      const result = await this.mainProcessor.processNext();

      const duration = Date.now() - startTime;
      this.stats.processingTimes.push(duration);
      this.stats.processed++;

      if (result.status === 'completed') {
        this.stats.completed++;
        console.log(`   ✅ Completed in ${duration}ms`);
      } else if (result.status === 'failed') {
        this.stats.failed++;
        this.stats.errors.push({
          work_id: result.work_id,
          file: workItem.file.path,
          error: result.error,
          timestamp: new Date().toISOString()
        });
        console.error(`   ❌ Failed: ${result.error}`);
      } else if (result.status === 'idle') {
        // This shouldn't happen, but handle it
        this.stats.skipped++;
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.stats.processingTimes.push(duration);
      this.stats.processed++;
      this.stats.failed++;

      this.stats.errors.push({
        work_id: workItem.id,
        file: workItem.file.path,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.error(`   ❌ Exception: ${error.message}`);
    } finally {
      // Remove from current batch
      const index = this.stats.currentBatch.indexOf(workItem.id);
      if (index > -1) {
        this.stats.currentBatch.splice(index, 1);
      }
    }
  }

  /**
   * Start progress logger (periodic status updates)
   */
  startProgressLogger() {
    if (!this.options.progressInterval || this.options.progressInterval <= 0) {
      return null;
    }

    return setInterval(() => {
      const elapsed = Date.now() - this.stats.startTime;
      const elapsedSec = Math.floor(elapsed / 1000);
      const avgTime = this.stats.processingTimes.length > 0
        ? this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length
        : 0;

      const remaining = this.stats.totalItems - this.stats.processed;
      const estimatedTimeRemaining = remaining * avgTime;
      const etaMin = Math.floor(estimatedTimeRemaining / 60000);
      const etaSec = Math.floor((estimatedTimeRemaining % 60000) / 1000);

      console.log(`\n⏱️  Progress Update (${elapsedSec}s elapsed):`);
      console.log(`   Processed: ${this.stats.processed}/${this.stats.totalItems} (${Math.floor(this.stats.processed / this.stats.totalItems * 100)}%)`);
      console.log(`   Completed: ${this.stats.completed}`);
      console.log(`   Failed: ${this.stats.failed}`);
      console.log(`   Avg time: ${Math.floor(avgTime)}ms per item`);
      console.log(`   ETA: ~${etaMin}m ${etaSec}s`);
      if (this.stats.currentBatch.length > 0) {
        console.log(`   Currently processing: ${this.stats.currentBatch.length} item(s)`);
      }
    }, this.options.progressInterval);
  }

  /**
   * Generate completion report
   */
  generateReport() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationSec = Math.floor(duration / 1000);
    const durationMin = Math.floor(durationSec / 60);

    const avgTime = this.stats.processingTimes.length > 0
      ? this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length
      : 0;

    const minTime = this.stats.processingTimes.length > 0
      ? Math.min(...this.stats.processingTimes)
      : 0;

    const maxTime = this.stats.processingTimes.length > 0
      ? Math.max(...this.stats.processingTimes)
      : 0;

    const successRate = this.stats.processed > 0
      ? (this.stats.completed / this.stats.processed * 100).toFixed(1)
      : 0;

    return {
      summary: {
        total_items: this.stats.totalItems,
        processed: this.stats.processed,
        completed: this.stats.completed,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        success_rate: `${successRate}%`
      },
      timing: {
        start_time: new Date(this.stats.startTime).toISOString(),
        end_time: new Date(this.stats.endTime).toISOString(),
        total_duration_ms: duration,
        total_duration_readable: `${durationMin}m ${durationSec % 60}s`,
        average_time_ms: Math.floor(avgTime),
        min_time_ms: minTime,
        max_time_ms: maxTime,
        throughput_per_min: this.stats.processed > 0 ? (this.stats.processed / (duration / 60000)).toFixed(2) : 0
      },
      errors: this.stats.errors,
      options: this.options
    };
  }

  /**
   * Display completion report
   */
  displayReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BATCH PROCESSING REPORT');
    console.log('='.repeat(60));

    console.log('\n📈 Summary:');
    console.log(`   Total items: ${report.summary.total_items}`);
    console.log(`   Processed: ${report.summary.processed}`);
    console.log(`   ✅ Completed: ${report.summary.completed}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    if (report.summary.skipped > 0) {
      console.log(`   ⏭️  Skipped: ${report.summary.skipped}`);
    }
    console.log(`   Success Rate: ${report.summary.success_rate}`);

    console.log('\n⏱️  Timing:');
    console.log(`   Total duration: ${report.timing.total_duration_readable}`);
    console.log(`   Average time: ${report.timing.average_time_ms}ms per item`);
    console.log(`   Min time: ${report.timing.min_time_ms}ms`);
    console.log(`   Max time: ${report.timing.max_time_ms}ms`);
    console.log(`   Throughput: ${report.timing.throughput_per_min} items/min`);

    if (report.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.file}`);
        console.log(`      Error: ${err.error}`);
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
      outputPath = path.join(this.vaultPath, '.obsidian/state', `batch-report-${timestamp}.json`);
    }

    await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`💾 Report saved to: ${outputPath}\n`);

    return outputPath;
  }
}

module.exports = BatchProcessor;

// CLI Interface
if (require.main === module) {
  const vaultPath = process.argv[2] || process.cwd();

  // Parse options from command line
  const options = {
    parallel: process.argv.includes('--parallel'),
    maxParallel: parseInt(process.argv.find(arg => arg.startsWith('--max-parallel='))?.split('=')[1]) || 3,
    stopOnError: process.argv.includes('--stop-on-error'),
    delayBetweenItems: parseInt(process.argv.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || 500,
    progressInterval: parseInt(process.argv.find(arg => arg.startsWith('--progress='))?.split('=')[1]) || 5000
  };

  const batchProcessor = new BatchProcessor(vaultPath, options);

  (async () => {
    try {
      const report = await batchProcessor.processAll();

      // Save report if requested
      if (process.argv.includes('--save-report')) {
        await batchProcessor.saveReport(report);
      }

      // Exit with appropriate code
      process.exit(report.summary.failed > 0 ? 1 : 0);

    } catch (error) {
      console.error('❌ Fatal error in batch processor:', error);
      process.exit(1);
    }
  })();
}
