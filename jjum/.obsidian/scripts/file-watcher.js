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

    // Phase 4: Enhanced statistics tracking
    this.stats = {
      files_added: 0,
      files_modified: 0,
      files_deleted: 0,
      files_queued: 0,
      errors: 0,
      started_at: null,
      by_type: {},
      by_source: {}
    };
  }

  /**
   * Start watching the inbox directory
   */
  async start() {
    this.stats.started_at = new Date().toISOString();
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
    this.stats.files_added++;

    try {
      // Phase 4: Enhanced metadata detection with file type
      const metadata = await this.detectMetadata(filePath);
      const fileType = this.detectFileType(filePath, metadata);

      metadata.file_type = fileType;

      // Update stats
      this.stats.by_type[fileType] = (this.stats.by_type[fileType] || 0) + 1;
      this.stats.by_source[metadata.source] = (this.stats.by_source[metadata.source] || 0) + 1;

      // Add to work queue
      const workId = await this.queueManager.addToQueue(relativePath, metadata);

      if (workId) {
        this.processedFiles.add(filePath);
        this.stats.files_queued++;
        console.log(`   ✅ Added to work queue (ID: ${workId})`);
        console.log(`   📊 Type: ${fileType}, Source: ${metadata.source}\n`);
      }

    } catch (error) {
      this.stats.errors++;
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
   * Detect metadata from file path and name (Enhanced in Phase 4)
   */
  async detectMetadata(filePath) {
    const fs = require('fs');
    const matter = require('gray-matter');

    const fileName = path.basename(filePath, '.md');
    const relativePath = path.relative(this.vaultPath, filePath);

    const metadata = {
      detected_at: new Date().toISOString(),
      file_size: 0,
      word_count: 0
    };

    // Phase 4: Read file stats and basic content
    try {
      const stats = fs.statSync(filePath);
      metadata.file_size = stats.size;
      metadata.created_time = stats.birthtime.toISOString();
      metadata.modified_time = stats.mtime.toISOString();

      // Read content for analysis
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      metadata.word_count = body.split(/\s+/).filter(w => w.length > 0).length;

      // Extract title from frontmatter if available
      if (frontmatter.title) {
        metadata.title = frontmatter.title;
      }

      // Extract source from frontmatter if available
      if (frontmatter.source) {
        metadata.source = frontmatter.source;
      }
    } catch (error) {
      // File may not be fully written yet
      console.log(`   ⚠️  Could not read file metadata: ${error.message}`);
    }

    // Detect if from git-imports subfolder
    if (relativePath.includes('git-imports')) {
      metadata.source = metadata.source || 'git-commit';

      // Try to extract commit hash from filename (format: hash-filename.md)
      const match = fileName.match(/^([a-f0-9]{7,40})-(.+)$/);
      if (match) {
        metadata.commit_hash = match[1];
        metadata.original_filename = match[2];
      }
    }

    // Detect web clipper patterns
    if (fileName.includes('http') || fileName.includes('www') || fileName.includes('clip')) {
      metadata.source = metadata.source || 'web-clipper';
    }

    // Detect if it's a note/reference
    if (fileName.includes('note') || fileName.includes('reference')) {
      metadata.source = metadata.source || 'note';
    }

    // Default source if not detected
    if (!metadata.source) {
      metadata.source = 'inbox-file';
    }

    return metadata;
  }

  /**
   * Detect file type based on various signals (Phase 4)
   */
  detectFileType(filePath, metadata) {
    const fileName = path.basename(filePath, '.md').toLowerCase();

    // Git commit
    if (metadata.source === 'git-commit' || metadata.commit_hash) {
      return 'git-commit';
    }

    // Web clip
    if (metadata.source === 'web-clipper') {
      return 'web-clip';
    }

    // Tutorial/Guide (based on filename)
    if (fileName.includes('tutorial') || fileName.includes('guide') || fileName.includes('how-to')) {
      return 'tutorial';
    }

    // Code snippet/example
    if (fileName.includes('example') || fileName.includes('snippet') || fileName.includes('code')) {
      return 'code-example';
    }

    // Reference/Documentation
    if (fileName.includes('reference') || fileName.includes('doc') || fileName.includes('api')) {
      return 'reference';
    }

    // Note
    if (fileName.includes('note')) {
      return 'note';
    }

    // Article (longer content)
    if (metadata.word_count > 500) {
      return 'article';
    }

    // Short note (brief content)
    if (metadata.word_count < 100) {
      return 'quick-note';
    }

    return 'document';
  }

  /**
   * Get watcher statistics (Enhanced in Phase 4)
   */
  async getStats() {
    const uptime = this.stats.started_at
      ? Date.now() - new Date(this.stats.started_at).getTime()
      : 0;

    return {
      watching: this.inboxPath,
      is_running: this.watcher !== null,
      started_at: this.stats.started_at,
      uptime_ms: uptime,
      uptime_readable: this.formatUptime(uptime),

      // File statistics
      processed_files: this.processedFiles.size,
      files_added: this.stats.files_added,
      files_modified: this.stats.files_modified,
      files_deleted: this.stats.files_deleted,
      files_queued: this.stats.files_queued,
      errors: this.stats.errors,

      // Breakdown by type and source
      by_type: this.stats.by_type,
      by_source: this.stats.by_source,

      // Queue stats
      queue_stats: await this.queueManager.getStats()
    };
  }

  /**
   * Format uptime in human-readable format (Phase 4)
   */
  formatUptime(ms) {
    if (!ms) return 'Not started';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
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
