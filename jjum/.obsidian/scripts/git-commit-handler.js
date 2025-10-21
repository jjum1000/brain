#!/usr/bin/env node

/**
 * Git Commit Handler
 *
 * Extracts commit metadata and adds commit information to the work queue
 * This can be called from a git post-commit hook or manually
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const QueueManager = require('./queue-manager');

class GitCommitHandler {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || path.resolve(__dirname, '../..');
    this.queueManager = new QueueManager(this.vaultPath);
  }

  /**
   * Get the latest commit metadata
   */
  getLatestCommit() {
    try {
      // Get commit hash
      const hash = execSync('git rev-parse HEAD', {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get commit message
      const message = execSync('git log -1 --pretty=%B', {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get author
      const author = execSync('git log -1 --pretty=%an', {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get author email
      const email = execSync('git log -1 --pretty=%ae', {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get timestamp
      const timestamp = execSync('git log -1 --pretty=%ai', {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get changed files
      const changedFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim().split('\n').filter(f => f.length > 0);

      return {
        hash,
        message,
        author,
        email,
        timestamp,
        changed_files: changedFiles,
        total_files: changedFiles.length
      };
    } catch (err) {
      console.error('Error getting commit metadata:', err.message);
      return null;
    }
  }

  /**
   * Get commit metadata for a specific commit hash
   */
  getCommit(commitHash) {
    try {
      // Get commit message
      const message = execSync(`git log -1 --pretty=%B ${commitHash}`, {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get author
      const author = execSync(`git log -1 --pretty=%an ${commitHash}`, {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get author email
      const email = execSync(`git log -1 --pretty=%ae ${commitHash}`, {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get timestamp
      const timestamp = execSync(`git log -1 --pretty=%ai ${commitHash}`, {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim();

      // Get changed files
      const changedFiles = execSync(`git diff-tree --no-commit-id --name-only -r ${commitHash}`, {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      }).trim().split('\n').filter(f => f.length > 0);

      return {
        hash: commitHash,
        message,
        author,
        email,
        timestamp,
        changed_files: changedFiles,
        total_files: changedFiles.length
      };
    } catch (err) {
      console.error(`Error getting commit metadata for ${commitHash}:`, err.message);
      return null;
    }
  }

  /**
   * Create a git commit document in 00_Inbox
   */
  async createCommitDocument(commitData) {
    const inboxPath = path.join(this.vaultPath, '00_Inbox');

    // Ensure inbox exists
    if (!fs.existsSync(inboxPath)) {
      fs.mkdirSync(inboxPath, { recursive: true });
    }

    // Create filename from commit hash (short version)
    const shortHash = commitData.hash.substring(0, 7);
    const filename = `git-commit-${shortHash}.md`;
    const filePath = path.join(inboxPath, filename);

    // Extract commit type from message (conventional commits)
    const commitTypeMatch = commitData.message.match(/^(\w+)(\(.+\))?:/);
    const commitType = commitTypeMatch ? commitTypeMatch[1] : 'other';

    // Create frontmatter
    const frontmatter = {
      type: 'git-commit',
      source: 'git-hook',
      commit_hash: commitData.hash,
      commit_hash_short: shortHash,
      commit_type: commitType,
      author: commitData.author,
      email: commitData.email,
      timestamp: commitData.timestamp,
      created_at: new Date().toISOString(),
      total_files: commitData.total_files,
      tags: ['git', 'commit', commitType]
    };

    // Create document content
    const content = `---
${Object.entries(frontmatter).map(([key, value]) => {
  if (Array.isArray(value)) {
    return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
  }
  return `${key}: ${value}`;
}).join('\n')}
---

# Git Commit: ${shortHash}

## Commit Message

\`\`\`
${commitData.message}
\`\`\`

## Details

- **Hash**: \`${commitData.hash}\`
- **Author**: ${commitData.author} <${commitData.email}>
- **Date**: ${commitData.timestamp}
- **Files Changed**: ${commitData.total_files}

## Changed Files

${commitData.changed_files.map(file => `- \`${file}\``).join('\n')}

## Notes

<!-- Add your notes about this commit here -->
`;

    // Write the file
    fs.writeFileSync(filePath, content, 'utf-8');

    console.log(`✅ Created commit document: ${filename}`);

    return filePath;
  }

  /**
   * Process the latest commit
   */
  async processLatestCommit() {
    console.log('📝 Processing latest git commit...');

    const commitData = this.getLatestCommit();

    if (!commitData) {
      console.error('❌ Failed to get commit metadata');
      return null;
    }

    console.log(`\n📋 Commit Info:`);
    console.log(`   Hash: ${commitData.hash.substring(0, 7)}`);
    console.log(`   Author: ${commitData.author}`);
    console.log(`   Message: ${commitData.message.split('\n')[0]}`);
    console.log(`   Files: ${commitData.total_files}`);

    // Create commit document
    const filePath = await this.createCommitDocument(commitData);

    // Add to work queue
    const relPath = path.relative(this.vaultPath, filePath);
    await this.queueManager.addToQueue(relPath, {
      source: 'git-hook',
      commit_hash: commitData.hash
    });

    console.log(`✅ Added to work queue: ${relPath}`);

    return filePath;
  }

  /**
   * Process a specific commit by hash
   */
  async processCommit(commitHash) {
    console.log(`📝 Processing commit: ${commitHash}`);

    const commitData = this.getCommit(commitHash);

    if (!commitData) {
      console.error(`❌ Failed to get commit metadata for ${commitHash}`);
      return null;
    }

    console.log(`\n📋 Commit Info:`);
    console.log(`   Hash: ${commitData.hash.substring(0, 7)}`);
    console.log(`   Author: ${commitData.author}`);
    console.log(`   Message: ${commitData.message.split('\n')[0]}`);
    console.log(`   Files: ${commitData.total_files}`);

    // Create commit document
    const filePath = await this.createCommitDocument(commitData);

    // Add to work queue
    const relPath = path.relative(this.vaultPath, filePath);
    await this.queueManager.addToQueue(relPath, {
      source: 'git-hook',
      commit_hash: commitData.hash
    });

    console.log(`✅ Added to work queue: ${relPath}`);

    return filePath;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const vaultPath = path.resolve(__dirname, '../..');

  const handler = new GitCommitHandler(vaultPath);

  if (args.length === 0) {
    // No arguments - process latest commit
    await handler.processLatestCommit();
  } else if (args[0] === 'latest') {
    // Explicitly process latest
    await handler.processLatestCommit();
  } else {
    // Process specific commit hash
    const commitHash = args[0];
    await handler.processCommit(commitHash);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = GitCommitHandler;
