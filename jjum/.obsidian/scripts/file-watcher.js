const chokidar = require('chokidar');
const path = require('path');
const WorkQueueManager = require('./queue-manager');

class FileWatcher {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.inboxPath = path.join(this.vaultPath, '00_Inbox');
    this.queueManager = new WorkQueueManager(this.vaultPath);
    this.watcher = null;
    this.processedFiles = new Set();
  }

  /**
   * Start watching the inbox directory
   */
  async start() {
    console.log('👁️  File Watcher Started');
    console.log(`   Watching: ${this.inboxPath}\n`);

    // Initialize watcher
    this.watcher = chokidar.watch(this.inboxPath, {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: false, // Process existing files on startup
      awaitWriteFinish: {
        stabilityThreshold: 2000, // Wait 2s after last change
        pollInterval: 100
      }
    });

    // Event handlers
    this.watcher
      .on('add', (filePath) => this.handleFileAdded(filePath))
      .on('change', (filePath) => this.handleFileChanged(filePath))
      .on('unlink', (filePath) => this.handleFileDeleted(filePath))
      .on('error', (error) => this.handleError(error))
      .on('ready', () => {
        console.log('✅ File Watcher Ready\n');
        console.log('Waiting for file changes...\n');
      });

    // Keep process running
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down file watcher...');
      this.stop();
      process.exit(0);
    });
  }

  /**
   * Stop watching
   */
  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      console.log('✅ File Watcher Stopped');
    }
  }

  /**
   * Handle new file added
   */
  async handleFileAdded(filePath) {
    // Only process .md files
    if (!filePath.endsWith('.md')) {
      return;
    }

    // Skip if already processed
    if (this.processedFiles.has(filePath)) {
      return;
    }

    const relativePath = path.relative(this.vaultPath, filePath);

    console.log(`📄 New file detected: ${relativePath}`);

    try {
      // Detect metadata from file path and name
      const metadata = this.detectMetadata(filePath);

      // Add to work queue
      const workId = await this.queueManager.addToQueue(relativePath, metadata);

      if (workId) {
        this.processedFiles.add(filePath);
        console.log(`   ✅ Added to work queue (ID: ${workId})\n`);
      }

    } catch (error) {
      console.error(`   ❌ Failed to add to queue: ${error.message}\n`);
    }
  }

  /**
   * Handle file changed
   */
  async handleFileChanged(filePath) {
    // Only process .md files
    if (!filePath.endsWith('.md')) {
      return;
    }

    const relativePath = path.relative(this.vaultPath, filePath);
    console.log(`📝 File modified: ${relativePath}`);

    // Check if file is already in queue or being processed
    const queue = await this.queueManager.getAll();
    const inQueue = queue.some(item => item.file.path === relativePath);

    if (inQueue) {
      console.log(`   ⚠️  File already in queue, skipping\n`);
      return;
    }

    // Re-add to queue if not already there
    try {
      const metadata = this.detectMetadata(filePath);
      metadata.reason = 'modified';

      const workId = await this.queueManager.addToQueue(relativePath, metadata);

      if (workId) {
        console.log(`   ✅ Re-added to work queue (ID: ${workId})\n`);
      }

    } catch (error) {
      console.error(`   ❌ Failed to add to queue: ${error.message}\n`);
    }
  }

  /**
   * Handle file deleted
   */
  async handleFileDeleted(filePath) {
    const relativePath = path.relative(this.vaultPath, filePath);
    console.log(`🗑️  File deleted: ${relativePath}\n`);

    // Remove from processed files set
    this.processedFiles.delete(filePath);

    // Note: File might still be in queue, but will fail gracefully when processed
  }

  /**
   * Handle watcher errors
   */
  handleError(error) {
    console.error('❌ File Watcher Error:', error.message);
  }

  /**
   * Detect metadata from file path and name
   */
  detectMetadata(filePath) {
    const fileName = path.basename(filePath, '.md');
    const relativePath = path.relative(this.vaultPath, filePath);

    const metadata = {
      detected_at: new Date().toISOString()
    };

    // Detect if from git-imports subfolder
    if (relativePath.includes('git-imports')) {
      metadata.source = 'git-commit';

      // Try to extract commit hash from filename (format: hash-filename.md)
      const match = fileName.match(/^([a-f0-9]{7,40})-(.+)$/);
      if (match) {
        metadata.commit_hash = match[1];
        metadata.original_filename = match[2];
      }
    }

    // Detect web clipper patterns
    if (fileName.includes('http') || fileName.includes('www')) {
      metadata.source = 'web-clipper';
    }

    // Default source if not detected
    if (!metadata.source) {
      metadata.source = 'inbox-file';
    }

    return metadata;
  }

  /**
   * Get watcher statistics
   */
  async getStats() {
    return {
      watching: this.inboxPath,
      is_running: this.watcher !== null,
      processed_files: this.processedFiles.size,
      queue_stats: await this.queueManager.getStats()
    };
  }

  /**
   * Scan inbox and add existing files to queue
   */
  async scanAndAdd() {
    const fs = require('fs');

    console.log('🔍 Scanning inbox for existing files...\n');

    const scan = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let count = 0;

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          count += scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const relativePath = path.relative(this.vaultPath, fullPath);

          // Check if already in queue
          const queue = this.queueManager.load();
          const exists = queue.queue?.some(item => item.file.path === relativePath);

          if (!exists && !this.processedFiles.has(fullPath)) {
            const metadata = this.detectMetadata(fullPath);
            metadata.reason = 'initial-scan';

            try {
              this.queueManager.addToQueue(relativePath, metadata);
              this.processedFiles.add(fullPath);
              count++;
            } catch (error) {
              console.error(`   ❌ Failed to add ${relativePath}: ${error.message}`);
            }
          }
        }
      }

      return count;
    };

    const added = scan(this.inboxPath);
    console.log(`\n✅ Scan complete: ${added} file(s) added to queue\n`);

    return added;
  }
}

module.exports = FileWatcher;

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'watch';
  const vaultPath = process.argv[3] || process.cwd();

  const watcher = new FileWatcher(vaultPath);

  (async () => {
    try {
      switch (command) {
        case 'watch':
          await watcher.start();
          break;

        case 'scan':
          await watcher.scanAndAdd();
          process.exit(0);
          break;

        case 'stats':
          const stats = await watcher.getStats();
          console.log('📊 File Watcher Statistics:\n');
          console.log(JSON.stringify(stats, null, 2));
          process.exit(0);
          break;

        default:
          console.log('Usage: node file-watcher.js [command] [vault-path]');
          console.log('Commands:');
          console.log('  watch - Start watching inbox directory (default)');
          console.log('  scan  - Scan inbox and add existing files to queue');
          console.log('  stats - Show watcher statistics');
          process.exit(0);
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
