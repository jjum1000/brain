#!/usr/bin/env node

/**
 * Git Hook Installation Script
 *
 * Installs the post-commit hook to automatically process git commits
 */

const fs = require('fs');
const path = require('path');

class GitHookInstaller {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || path.resolve(__dirname, '../..');

    // Find the actual git repository root
    this.gitRoot = this.findGitRoot(this.vaultPath);

    if (this.gitRoot) {
      this.gitHooksPath = path.join(this.gitRoot, '.git', 'hooks');
      this.postCommitPath = path.join(this.gitHooksPath, 'post-commit');
    }
  }

  /**
   * Find the git repository root by walking up the directory tree
   */
  findGitRoot(startPath) {
    let currentPath = startPath;

    while (currentPath) {
      const gitPath = path.join(currentPath, '.git');
      if (fs.existsSync(gitPath)) {
        return currentPath;
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        // Reached root without finding .git
        return null;
      }
      currentPath = parentPath;
    }

    return null;
  }

  /**
   * Check if .git directory exists
   */
  isGitRepository() {
    return this.gitRoot !== null;
  }

  /**
   * Check if hook is already installed
   */
  isHookInstalled() {
    if (!fs.existsSync(this.postCommitPath)) {
      return false;
    }

    const content = fs.readFileSync(this.postCommitPath, 'utf-8');
    return content.includes('git-commit-handler.js');
  }

  /**
   * Create the post-commit hook script
   */
  createHookScript() {
    const handlerPath = path.join(__dirname, 'git-commit-handler.js');
    const relativeHandlerPath = path.relative(this.gitHooksPath, handlerPath);

    const hookScript = `#!/bin/sh
#
# Post-commit hook for AI Agent Knowledge Management System
# Automatically creates a commit document and adds it to the work queue
#

# Get the directory where this script is located
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"

# Path to the git-commit-handler script (relative to hooks directory)
HANDLER_SCRIPT="${'$'}{HOOK_DIR}/${relativeHandlerPath.replace(/\\/g, '/')}"

# Run the handler (suppress output to avoid cluttering git commit)
node "$HANDLER_SCRIPT" latest > /dev/null 2>&1 || true

# Always exit successfully so git commit completes even if handler fails
exit 0
`;

    return hookScript;
  }

  /**
   * Install the hook
   */
  install() {
    console.log('🔧 Installing Git post-commit hook...\n');

    // Check if git repository
    if (!this.isGitRepository()) {
      console.error('❌ Not a git repository');
      console.error('   Initialize git first: git init');
      return false;
    }

    // Check if already installed
    if (this.isHookInstalled()) {
      console.log('ℹ️  Hook is already installed');
      console.log(`   Location: ${this.postCommitPath}`);
      return true;
    }

    // Ensure hooks directory exists
    if (!fs.existsSync(this.gitHooksPath)) {
      fs.mkdirSync(this.gitHooksPath, { recursive: true });
    }

    // Check if post-commit already exists
    if (fs.existsSync(this.postCommitPath)) {
      console.log('⚠️  Existing post-commit hook found');
      console.log('   Creating backup...');

      const backupPath = `${this.postCommitPath}.backup-${Date.now()}`;
      fs.copyFileSync(this.postCommitPath, backupPath);
      console.log(`   ✅ Backup created: ${path.basename(backupPath)}\n`);
    }

    // Create the hook script
    const hookScript = this.createHookScript();
    fs.writeFileSync(this.postCommitPath, hookScript, { mode: 0o755 });

    console.log('✅ Git hook installed successfully!');
    console.log(`   Location: ${this.postCommitPath}`);
    console.log('\n📋 What happens now:');
    console.log('   - Every git commit will create a document in 00_Inbox');
    console.log('   - The document will be added to the work queue');
    console.log('   - Run "node cli.js process-next" to process it\n');

    return true;
  }

  /**
   * Uninstall the hook
   */
  uninstall() {
    console.log('🔧 Uninstalling Git post-commit hook...\n');

    if (!fs.existsSync(this.postCommitPath)) {
      console.log('ℹ️  Hook is not installed');
      return true;
    }

    const content = fs.readFileSync(this.postCommitPath, 'utf-8');

    if (!content.includes('git-commit-handler.js')) {
      console.log('⚠️  Found a post-commit hook, but it\'s not ours');
      console.log('   Not removing to preserve existing hook');
      return false;
    }

    // Remove the hook
    fs.unlinkSync(this.postCommitPath);
    console.log('✅ Git hook uninstalled successfully');

    return true;
  }

  /**
   * Show hook status
   */
  status() {
    console.log('📊 Git Hook Status\n');

    console.log(`Repository: ${this.isGitRepository() ? '✅ Found' : '❌ Not found'}`);

    if (this.isGitRepository()) {
      console.log(`Git root: ${this.gitRoot}`);
      console.log(`Vault path: ${this.vaultPath}`);
      console.log(`Hook installed: ${this.isHookInstalled() ? '✅ Yes' : '❌ No'}`);

      if (this.isHookInstalled()) {
        console.log(`Hook location: ${this.postCommitPath}`);
      }
    }

    console.log();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const vaultPath = path.resolve(__dirname, '../..');

  const installer = new GitHookInstaller(vaultPath);

  const command = args[0] || 'install';

  switch (command) {
    case 'install':
      installer.install();
      break;

    case 'uninstall':
      installer.uninstall();
      break;

    case 'status':
      installer.status();
      break;

    case 'help':
      console.log(`
Git Hook Installation Script

Usage:
  node install-git-hook.js [command]

Commands:
  install      Install the post-commit hook (default)
  uninstall    Uninstall the post-commit hook
  status       Show installation status
  help         Show this help message

Examples:
  node install-git-hook.js
  node install-git-hook.js install
  node install-git-hook.js status
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "node install-git-hook.js help" for usage');
      process.exit(1);
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

module.exports = GitHookInstaller;
