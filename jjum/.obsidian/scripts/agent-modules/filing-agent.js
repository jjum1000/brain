const BaseAgent = require('../base-agent');
const FilingRulesEngine = require('../filing-rules-engine');
const path = require('path');

class FilingAgent extends BaseAgent {
  constructor(vaultPath) {
    super('filing', vaultPath);
    this.rulesEngine = new FilingRulesEngine(vaultPath);
  }

  /**
   * Main processing logic
   */
  async process(documentState) {
    this.log('info', `Filing document: ${documentState.path}`);

    // 1. Check if already filed (not in inbox)
    if (!documentState.path.includes('00_Inbox')) {
      this.log('info', 'Document already filed, skipping');
      return {
        filed: false,
        reason: 'already_filed',
        current_location: documentState.path
      };
    }

    // 2. Determine destination using Filing Rules Engine
    const metadata = {
      source: documentState.source || documentState.frontmatter?.source
    };

    const destination = await this.rulesEngine.determineDestination(
      documentState,
      metadata
    );

    this.log('info', `Destination determined: ${destination.destination}`);
    this.log('info', `Matched rule: ${destination.rule_name}`);

    // 3. Generate destination file path
    const destinationPath = await this.rulesEngine.generateFilePath(
      documentState,
      destination.destination
    );

    // 4. Update frontmatter with filing information
    const updatedFrontmatter = {
      ...documentState.frontmatter,
      filed_at: new Date().toISOString(),
      filed_from: documentState.path,
      filing_rule: destination.rule_id,
      destination_folder: destination.destination
    };

    // 5. Save document with updated frontmatter (before moving)
    await this.saveDocument(
      documentState.path,
      updatedFrontmatter,
      documentState.body
    );

    // 6. Move file to destination
    const finalPath = await this.moveFile(
      documentState.path,
      destinationPath
    );

    this.log('info', `Filed: ${documentState.path} -> ${finalPath}`);

    return {
      filed: true,
      original_path: documentState.path,
      final_path: finalPath,
      destination_folder: destination.destination,
      rule_applied: destination.rule_name
    };
  }

  /**
   * Validate destination folder exists
   */
  async validateDestination(destinationFolder) {
    const fs = require('fs');
    const fullPath = path.join(this.vaultPath, destinationFolder);

    if (!fs.existsSync(fullPath)) {
      this.log('warn', `Destination folder does not exist: ${destinationFolder}`);
      this.log('info', `Creating folder: ${fullPath}`);

      fs.mkdirSync(fullPath, { recursive: true });
    }

    return true;
  }

  /**
   * Check if file would conflict with existing file
   */
  async checkConflict(destinationPath) {
    const fs = require('fs');
    const fullPath = path.isAbsolute(destinationPath)
      ? destinationPath
      : path.join(this.vaultPath, destinationPath);

    return fs.existsSync(fullPath);
  }

  /**
   * Generate safe filename if conflict exists
   */
  async generateSafeFilename(destinationPath) {
    const fs = require('fs');
    let safePath = destinationPath;
    let counter = 1;

    const fullPath = path.isAbsolute(destinationPath)
      ? destinationPath
      : path.join(this.vaultPath, destinationPath);

    while (fs.existsSync(safePath)) {
      const ext = path.extname(destinationPath);
      const base = path.basename(destinationPath, ext);
      const dir = path.dirname(destinationPath);

      safePath = path.join(dir, `${base}-${counter}${ext}`);
      counter++;
    }

    if (safePath !== destinationPath) {
      this.log('warn', `Filename conflict, using: ${safePath}`);
    }

    return safePath;
  }

  /**
   * Create backup before moving (optional)
   */
  async createBackup(filePath) {
    const fs = require('fs');

    const backupDir = path.join(this.vaultPath, '.obsidian/backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.basename(filePath);
    const backupPath = path.join(backupDir, `${timestamp}-${filename}`);

    const sourceAbsolute = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.vaultPath, filePath);

    fs.copyFileSync(sourceAbsolute, backupPath);

    this.log('info', `Backup created: ${backupPath}`);
    return backupPath;
  }

  /**
   * Get filing statistics
   */
  async getFilingStats() {
    const CompletionLog = require('../completion-log');
    const completionLog = new CompletionLog(this.vaultPath);

    const recentCompletions = await completionLog.getRecent(100);

    const stats = {
      total_filed: 0,
      by_destination: {},
      by_rule: {},
      by_source: {}
    };

    recentCompletions.forEach(record => {
      if (record.metadata?.destination_folder) {
        stats.total_filed++;

        const dest = record.metadata.destination_folder;
        stats.by_destination[dest] = (stats.by_destination[dest] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Suggest destination based on similar documents
   */
  async suggestDestination(documentState) {
    // Get similar documents based on tags
    const tags = documentState.tags || documentState.frontmatter?.tags || [];

    if (tags.length === 0) {
      return null;
    }

    // Load completion log to find similar documents
    const CompletionLog = require('../completion-log');
    const completionLog = new CompletionLog(this.vaultPath);

    const recent = await completionLog.getRecent(50);

    // Find documents with similar tags
    const similarDocs = recent.filter(record => {
      const recordTags = record.metadata?.tags_added || [];
      const commonTags = tags.filter(tag => recordTags.includes(tag));
      return commonTags.length > 0;
    });

    if (similarDocs.length === 0) {
      return null;
    }

    // Get most common destination
    const destinations = {};
    similarDocs.forEach(doc => {
      const dest = doc.metadata?.destination_folder;
      if (dest) {
        destinations[dest] = (destinations[dest] || 0) + 1;
      }
    });

    // Return most common destination
    const sorted = Object.entries(destinations).sort((a, b) => b[1] - a[1]);

    if (sorted.length > 0) {
      return {
        destination: sorted[0][0],
        confidence: sorted[0][1] / similarDocs.length,
        similar_docs: similarDocs.length
      };
    }

    return null;
  }
}

module.exports = FilingAgent;
