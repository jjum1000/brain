const WorkQueueManager = require('./queue-manager');
const ProcessingManifest = require('./processing-manifest');
const CompletionLog = require('./completion-log');
const BaseAgent = require('./base-agent');
const fs = require('fs');
const path = require('path');

class MainProcessor {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.queueManager = new WorkQueueManager(this.vaultPath);
    this.manifest = new ProcessingManifest(this.vaultPath);
    this.completionLog = new CompletionLog(this.vaultPath);
    this.maxRetries = 3;
  }

  /**
   * Process next document from queue
   */
  async processNext() {
    console.log('🤖 AI Agent - Processing Next Document\n');

    // Step 1: Get next work item from queue
    console.log('📋 Checking Work Queue...');
    const nextWork = await this.queueManager.getNext();

    if (!nextWork) {
      console.log('✅ No documents to process (queue is empty)\n');
      return { status: 'idle', message: 'Queue is empty' };
    }

    console.log(`📄 Found work item: ${nextWork.file.path}`);
    console.log(`   ID: ${nextWork.id}`);
    console.log(`   Type: ${nextWork.type}`);
    console.log(`   Priority: ${nextWork.priority}`);
    console.log(`   Required agents: ${nextWork.required_agents.join(', ')}\n`);

    // Step 2: Move to Processing Manifest
    console.log('🔄 Starting processing...');
    const workItem = await this.queueManager.startProcessing(nextWork.id);
    await this.manifest.add(workItem);

    // Step 3: Execute agent pipeline
    console.log('⚙️  Executing Agent Pipeline\n');

    try {
      await this.executeAgentPipeline(workItem);

      // Step 4: Mark as complete
      const finalState = await this.loadDocumentState(workItem.file.path);
      const processingRecord = await this.manifest.complete(workItem.id, {
        final_path: finalState.path,
        keywords_extracted: finalState.keywords?.length || 0,
        links_created: finalState.linked_concepts?.length || 0,
        tags_added: finalState.tags || [],
        destination_folder: path.dirname(finalState.path)
      });

      // Step 5: Add to completion log
      await this.completionLog.add(processingRecord, {
        final_path: finalState.path,
        keywords_extracted: finalState.keywords?.length || 0,
        links_created: finalState.linked_concepts?.length || 0,
        tags_added: finalState.tags || [],
        destination_folder: path.dirname(finalState.path)
      });

      console.log(`\n✅ Processing Complete!`);
      console.log(`📁 Final location: ${finalState.path}\n`);

      return {
        status: 'completed',
        work_id: workItem.id,
        file: finalState.path
      };

    } catch (error) {
      console.error(`\n❌ Processing Failed: ${error.message}\n`);

      // Remove from manifest on fatal error
      await this.manifest.remove(workItem.id);

      return {
        status: 'failed',
        work_id: workItem.id,
        error: error.message
      };
    }
  }

  /**
   * Execute agent pipeline for a work item
   */
  async executeAgentPipeline(workItem) {
    for (const agentName of workItem.required_agents) {
      console.log(`   [${agentName}] Starting...`);

      // Update status to in-progress
      await this.manifest.updateAgent(workItem.id, agentName, 'in-progress');

      let retries = 0;
      let success = false;

      while (retries <= this.maxRetries && !success) {
        try {
          // Load agent module
          const agent = await this.loadAgent(agentName);

          // Load current document state
          const documentState = await this.loadDocumentState(workItem.file.path);

          // Execute agent
          const result = await agent.execute(documentState);

          if (result.status === 'completed') {
            // Update status to completed
            await this.manifest.updateAgent(workItem.id, agentName, 'completed', result);
            console.log(`   [${agentName}] ✅ Completed (${result.duration_ms}ms)`);
            success = true;
          } else {
            throw new Error(result.error || 'Agent execution failed');
          }

        } catch (error) {
          retries++;

          if (retries <= this.maxRetries) {
            console.log(`   [${agentName}] ⚠️  Failed, retrying (${retries}/${this.maxRetries})...`);
            await this.manifest.incrementRetry(workItem.id);
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
          } else {
            console.error(`   [${agentName}] ❌ Failed after ${this.maxRetries} retries: ${error.message}`);

            // Update status to failed
            await this.manifest.updateAgent(workItem.id, agentName, 'failed', {
              error: error.message,
              stack: error.stack
            });

            throw new Error(`Agent ${agentName} failed: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * Load agent module
   */
  async loadAgent(agentName) {
    const agentPath = path.join(this.vaultPath, '.obsidian/scripts/agent-modules', `${agentName}-agent.js`);

    if (!fs.existsSync(agentPath)) {
      throw new Error(`Agent module not found: ${agentPath}`);
    }

    const AgentClass = require(agentPath);
    return new AgentClass(this.vaultPath);
  }

  /**
   * Load document state from file
   */
  async loadDocumentState(filePath) {
    const baseAgent = new BaseAgent('loader', this.vaultPath);
    return await baseAgent.loadDocumentState(filePath);
  }

  /**
   * Process all items in queue
   */
  async processAll() {
    console.log('🤖 AI Agent - Processing All Documents\n');

    const stats = await this.queueManager.getStats();
    console.log(`📊 Queue Statistics:`);
    console.log(`   Total items: ${stats.total_items}`);
    console.log(`   By type:`, stats.by_type);
    console.log(`   By priority:`, stats.by_priority);
    console.log('');

    const results = {
      total: stats.total_items,
      completed: 0,
      failed: 0,
      errors: []
    };

    while (true) {
      const result = await this.processNext();

      if (result.status === 'idle') {
        break;
      } else if (result.status === 'completed') {
        results.completed++;
      } else if (result.status === 'failed') {
        results.failed++;
        results.errors.push({
          work_id: result.work_id,
          error: result.error
        });
      }

      // Small delay between items
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n📊 Batch Processing Complete:');
    console.log(`   Total processed: ${results.completed + results.failed}/${results.total}`);
    console.log(`   Successful: ${results.completed}`);
    console.log(`   Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(err => {
        console.log(`   - ${err.work_id}: ${err.error}`);
      });
    }

    return results;
  }

  /**
   * Retry failed processing items
   */
  async retryFailed() {
    console.log('🤖 AI Agent - Retrying Failed Items\n');

    const processingItems = await this.manifest.getAll();
    const failedItems = processingItems.filter(item =>
      item.agent_pipeline.some(a => a.status === 'failed')
    );

    if (failedItems.length === 0) {
      console.log('✅ No failed items to retry\n');
      return { status: 'idle', message: 'No failed items' };
    }

    console.log(`Found ${failedItems.length} failed item(s)\n`);

    for (const item of failedItems) {
      console.log(`🔄 Retrying: ${item.file_path}`);

      // Find first failed agent
      const failedAgent = item.agent_pipeline.find(a => a.status === 'failed');

      if (failedAgent) {
        console.log(`   Restarting from: ${failedAgent.name}`);

        // Reset agent status to pending
        await this.manifest.updateAgent(item.work_id, failedAgent.name, 'pending');

        // Continue pipeline from this point
        const remainingAgents = item.agent_pipeline
          .slice(item.agent_pipeline.indexOf(failedAgent))
          .map(a => a.name);

        const retryWorkItem = {
          id: item.work_id,
          file: { path: item.file_path },
          required_agents: remainingAgents
        };

        try {
          await this.executeAgentPipeline(retryWorkItem);
          console.log(`   ✅ Retry successful\n`);
        } catch (error) {
          console.error(`   ❌ Retry failed: ${error.message}\n`);
        }
      }
    }
  }

  /**
   * Get system status
   */
  async getStatus() {
    const queueStats = await this.queueManager.getStats();
    const manifestStats = await this.manifest.getStats();
    const completionStats = await this.completionLog.getStatistics('week');

    return {
      queue: queueStats,
      processing: manifestStats,
      completed: completionStats
    };
  }
}

module.exports = MainProcessor;

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'process-next';
  const vaultPath = process.argv[3] || process.cwd();

  const processor = new MainProcessor(vaultPath);

  (async () => {
    try {
      switch (command) {
        case 'process-next':
          await processor.processNext();
          break;

        case 'process-all':
          await processor.processAll();
          break;

        case 'retry-failed':
          await processor.retryFailed();
          break;

        case 'status':
          const status = await processor.getStatus();
          console.log('📊 System Status:\n');
          console.log('Queue:', JSON.stringify(status.queue, null, 2));
          console.log('\nProcessing:', JSON.stringify(status.processing, null, 2));
          console.log('\nCompleted (last week):', JSON.stringify(status.completed, null, 2));
          break;

        default:
          console.log('Usage: node main-processor.js [command] [vault-path]');
          console.log('Commands:');
          console.log('  process-next  - Process next item in queue (default)');
          console.log('  process-all   - Process all items in queue');
          console.log('  retry-failed  - Retry failed processing items');
          console.log('  status        - Show system status');
          break;
      }
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}
