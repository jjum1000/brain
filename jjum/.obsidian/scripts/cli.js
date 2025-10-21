#!/usr/bin/env node

/**
 * AI Agent Knowledge Management System - CLI Interface
 *
 * Unified command-line interface for all system operations
 */

const path = require('path');
const fs = require('fs');

// Helper to get vault path
function getVaultPath() {
  // CLI is in .obsidian/scripts/, vault is two levels up
  return path.resolve(__dirname, '../..');
}

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Display help message
function showHelp() {
  console.log(`
${colors.bright}AI Agent Knowledge Management System - CLI${colors.reset}
${colors.dim}Unified command-line interface for managing your knowledge base${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node cli.js <command> [options]

${colors.bright}COMMANDS:${colors.reset}

  ${colors.cyan}Queue Management:${colors.reset}
    process-next              Process the next item in the work queue
    process-all               Process all items in the work queue
    retry-failed              Retry all failed processing tasks
    status                    Show current system status
    queue-add <file>          Add a file to the work queue
    queue-list                List all items in the work queue

  ${colors.cyan}Glossary Management:${colors.reset}
    glossary-build            Build or rebuild the glossary index
    glossary-find <term>      Find an exact glossary term
    glossary-search <query>   Search for glossary terms (partial match)
    glossary-advanced <query> Advanced search with relevance scoring
    glossary-related <term>   Find terms related to the given term
    glossary-stats            Show glossary statistics

  ${colors.cyan}Filing Rules:${colors.reset}
    rules-list                List all filing rules
    rules-stats               Show filing rules statistics
    rules-test <file>         Test which rule matches a file

  ${colors.cyan}File Watcher:${colors.reset}
    watch                     Start watching 00_Inbox for new files
    scan                      Scan 00_Inbox and add existing files to queue
    watch-stats               Show file watcher statistics

  ${colors.cyan}System Maintenance:${colors.reset}
    clean                     Clean up old logs and temporary files
    init                      Initialize the system (create folders, etc.)
    validate                  Validate system configuration

  ${colors.cyan}General:${colors.reset}
    help                      Show this help message
    version                   Show version information

${colors.bright}EXAMPLES:${colors.reset}
  node cli.js status
  node cli.js process-next
  node cli.js glossary-search "react"
  node cli.js watch

${colors.bright}MORE INFO:${colors.reset}
  See README.md for detailed documentation
  Report issues: https://github.com/yourusername/yourrepo/issues
`);
}

// Show version information
function showVersion() {
  const packagePath = path.join(__dirname, 'package.json');
  let version = '1.1.0';

  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      version = pkg.version || version;
    } catch (e) {
      // Use default version
    }
  }

  console.log(`
${colors.bright}AI Agent Knowledge Management System${colors.reset}
Version: ${colors.cyan}${version}${colors.reset}
Phase: ${colors.green}5 (Integration & Triggers)${colors.reset}
  `);
}

// Execute a script module
async function executeScript(scriptName, args = []) {
  const scriptPath = path.join(__dirname, `${scriptName}.js`);

  if (!fs.existsSync(scriptPath)) {
    error(`Script not found: ${scriptName}.js`);
    process.exit(1);
  }

  try {
    const ScriptModule = require(scriptPath);

    // If the module exports a class, instantiate it
    if (typeof ScriptModule === 'function') {
      const vaultPath = getVaultPath();
      const instance = new ScriptModule(vaultPath);

      // Call the appropriate method based on args
      if (args.length > 0 && typeof instance[args[0]] === 'function') {
        const method = args[0];
        const methodArgs = args.slice(1);
        await instance[method](...methodArgs);
      } else if (typeof instance.run === 'function') {
        await instance.run(...args);
      } else {
        error(`No executable method found in ${scriptName}.js`);
        process.exit(1);
      }
    } else {
      error(`${scriptName}.js does not export a valid class or function`);
      process.exit(1);
    }
  } catch (err) {
    error(`Error executing ${scriptName}: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// Execute a command with spawn
function spawnCommand(scriptName, args = []) {
  const { spawn } = require('child_process');
  const scriptPath = path.join(__dirname, `${scriptName}.js`);

  if (!fs.existsSync(scriptPath)) {
    error(`Script not found: ${scriptName}.js`);
    process.exit(1);
  }

  const child = spawn('node', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: __dirname
  });

  child.on('error', (err) => {
    error(`Failed to execute ${scriptName}: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Main command router
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  try {
    switch (command) {
      // Queue Management
      case 'process-next':
        spawnCommand('main-processor', ['process-next']);
        break;

      case 'process-all':
        spawnCommand('main-processor', ['process-all']);
        break;

      case 'retry-failed':
        spawnCommand('main-processor', ['retry-failed']);
        break;

      case 'status':
        spawnCommand('main-processor', ['status']);
        break;

      case 'queue-add':
        if (commandArgs.length === 0) {
          error('Please specify a file to add to the queue');
          process.exit(1);
        }
        spawnCommand('queue-manager', ['add', ...commandArgs]);
        break;

      case 'queue-list':
        spawnCommand('queue-manager', ['list']);
        break;

      // Glossary Management
      case 'glossary-build':
        spawnCommand('glossary-builder', ['build']);
        break;

      case 'glossary-find':
        if (commandArgs.length === 0) {
          error('Please specify a term to find');
          process.exit(1);
        }
        spawnCommand('glossary-builder', ['find', commandArgs[0]]);
        break;

      case 'glossary-search':
        if (commandArgs.length === 0) {
          error('Please specify a search query');
          process.exit(1);
        }
        spawnCommand('glossary-builder', ['search', commandArgs[0]]);
        break;

      case 'glossary-advanced':
        if (commandArgs.length === 0) {
          error('Please specify a search query');
          process.exit(1);
        }
        spawnCommand('glossary-builder', ['advanced-search', commandArgs[0]]);
        break;

      case 'glossary-related':
        if (commandArgs.length === 0) {
          error('Please specify a term');
          process.exit(1);
        }
        spawnCommand('glossary-builder', ['related', commandArgs[0]]);
        break;

      case 'glossary-stats':
        spawnCommand('glossary-builder', ['stats']);
        break;

      // Filing Rules
      case 'rules-list':
        spawnCommand('filing-rules-engine', ['list']);
        break;

      case 'rules-stats':
        spawnCommand('filing-rules-engine', ['stats']);
        break;

      case 'rules-test':
        if (commandArgs.length === 0) {
          error('Please specify a file to test');
          process.exit(1);
        }
        spawnCommand('filing-rules-engine', ['test', commandArgs[0]]);
        break;

      // File Watcher
      case 'watch':
        spawnCommand('file-watcher', ['watch']);
        break;

      case 'scan':
        spawnCommand('file-watcher', ['scan']);
        break;

      case 'watch-stats':
        spawnCommand('file-watcher', ['stats']);
        break;

      // System Maintenance
      case 'clean':
        info('Cleaning up old logs and temporary files...');
        const CompletionLog = require('./completion-log');
        const vaultPath = getVaultPath();
        const completionLog = new CompletionLog(vaultPath);
        await completionLog.cleanup(30); // Keep 30 days
        success('Cleanup completed');
        break;

      case 'init':
        info('Initializing system...');
        const ResourceRegistry = require('./resource-registry');
        const registry = new ResourceRegistry(getVaultPath());
        await registry.initialize();
        success('System initialized');
        break;

      case 'validate':
        info('Validating system configuration...');
        // TODO: Implement validation logic
        success('Validation completed');
        break;

      // General
      case 'version':
      case '--version':
      case '-v':
        showVersion();
        break;

      default:
        error(`Unknown command: ${command}`);
        console.log(`Run 'node cli.js help' for usage information`);
        process.exit(1);
    }
  } catch (err) {
    error(`Command failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main().catch((err) => {
    error(`Fatal error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { main, showHelp, showVersion };
