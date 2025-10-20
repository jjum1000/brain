const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class WorkQueueManager {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.queuePath = path.join(this.vaultPath, '.obsidian/state/work-queue.json');
  }

  /**
   * Load work queue from file
   */
  async load() {
    try {
      const data = fs.readFileSync(this.queuePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load work queue:', error.message);
      return { version: '1.0', last_updated: null, queue: [] };
    }
  }

  /**
   * Save work queue to file
   */
  async save(queue) {
    try {
      fs.writeFileSync(this.queuePath, JSON.stringify(queue, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save work queue:', error.message);
      throw error;
    }
  }

  /**
   * Calculate file hash (SHA256)
   */
  async calculateHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      console.error('Failed to calculate hash:', error.message);
      return null;
    }
  }

  /**
   * Detect file type based on path and metadata
   */
  detectType(filePath, metadata = {}) {
    if (metadata.source === 'git-commit') {
      return 'git-commit';
    }
    if (metadata.source === 'web-clipper') {
      return 'web-clip';
    }
    if (filePath.includes('00_Inbox')) {
      return 'inbox-file';
    }
    return 'unknown';
  }

  /**
   * Calculate priority (lower number = higher priority)
   */
  calculatePriority(filePath, metadata = {}) {
    // Priority 1: Git commits (highest)
    if (metadata.source === 'git-commit') {
      return 1;
    }
    // Priority 2: Web clips
    if (metadata.source === 'web-clipper') {
      return 2;
    }
    // Priority 3: Manual inbox files
    if (filePath.includes('00_Inbox')) {
      return 3;
    }
    // Priority 4: Others
    return 4;
  }

  /**
   * Determine required agents based on file type
   */
  determineAgents(filePath, metadata = {}) {
    const type = this.detectType(filePath, metadata);

    switch (type) {
      case 'git-commit':
        return ['normalization', 'keyword-extraction', 'linking', 'tagging', 'filing'];
      case 'web-clip':
        return ['normalization', 'keyword-extraction', 'linking', 'filing'];
      case 'inbox-file':
        return ['normalization', 'keyword-extraction', 'linking', 'filing'];
      default:
        return ['normalization', 'filing'];
    }
  }

  /**
   * Add new work item to queue
   */
  async addToQueue(filePath, metadata = {}) {
    const queue = await this.load();

    // Check if file already exists in queue
    const exists = queue.queue.some(item => item.file.path === filePath);
    if (exists) {
      console.log(`File already in queue: ${filePath}`);
      return null;
    }

    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.vaultPath, filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.error(`File does not exist: ${absolutePath}`);
      return null;
    }

    const stats = fs.statSync(absolutePath);
    const hash = await this.calculateHash(absolutePath);

    const item = {
      id: `wq-${Date.now()}`,
      type: this.detectType(filePath, metadata),
      priority: this.calculatePriority(filePath, metadata),
      created_at: new Date().toISOString(),
      file: {
        path: filePath,
        size_bytes: stats.size,
        hash: hash ? `sha256:${hash}` : null,
        source: metadata.source || 'unknown'
      },
      required_agents: this.determineAgents(filePath, metadata),
      context: metadata
    };

    queue.queue.push(item);
    queue.last_updated = new Date().toISOString();

    await this.save(queue);

    console.log(`✅ Added to queue: ${filePath} (ID: ${item.id})`);
    return item.id;
  }

  /**
   * Get next work item (highest priority)
   */
  async getNext() {
    const queue = await this.load();

    if (queue.queue.length === 0) {
      return null;
    }

    // Sort by priority (lower number = higher priority)
    queue.queue.sort((a, b) => a.priority - b.priority);

    return queue.queue[0];
  }

  /**
   * Start processing a work item (move to Processing Manifest)
   */
  async startProcessing(workItemId) {
    const queue = await this.load();
    const index = queue.queue.findIndex(item => item.id === workItemId);

    if (index === -1) {
      throw new Error(`Work item ${workItemId} not found in queue`);
    }

    const item = queue.queue.splice(index, 1)[0];
    queue.last_updated = new Date().toISOString();
    await this.save(queue);

    console.log(`🔄 Started processing: ${item.file.path}`);
    return item;
  }

  /**
   * Remove item from queue
   */
  async remove(workItemId) {
    const queue = await this.load();
    const index = queue.queue.findIndex(item => item.id === workItemId);

    if (index === -1) {
      return false;
    }

    queue.queue.splice(index, 1);
    queue.last_updated = new Date().toISOString();
    await this.save(queue);

    return true;
  }

  /**
   * Get all items in queue
   */
  async getAll() {
    const queue = await this.load();
    return queue.queue;
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const queue = await this.load();

    return {
      total_items: queue.queue.length,
      by_type: queue.queue.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      by_priority: queue.queue.reduce((acc, item) => {
        acc[`priority_${item.priority}`] = (acc[`priority_${item.priority}`] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

module.exports = WorkQueueManager;
