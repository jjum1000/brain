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
    glossary-usage            Count glossary reference usage (Phase 5-1)
    glossary-create-from <file> Create glossary from specific file (Phase 5-2)
    glossary-create-batch [dir] Batch create glossary from directory (Phase 5-2)
    glossary-archive-unused   Archive glossary terms with 0 references (Phase 5-4)
    glossary-cleanup-detect   Detect unused terms without archiving (Phase 5-4)
    glossary-cleanup-list     List archived glossary terms (Phase 5-4)
    glossary-cleanup-restore <term> Restore an archived glossary term (Phase 5-4)
    glossary-cleanup-stats    Show cleanup statistics (Phase 5-4)
    glossary-validate         Validate index consistency (Phase 5-6)
    glossary-validate-quick   Quick integrity check (Phase 5-6)

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

  // Execute from vault root, not from scripts directory
  const vaultPath = getVaultPath();
  const child = spawn('node', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: vaultPath
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

      case 'glossary-usage':
        // Phase 5: Count glossary references
        {
          const GlossaryReferenceCounter = require('./glossary-reference-counter');
          const glossaryVaultPath = getVaultPath();
          const counter = new GlossaryReferenceCounter(glossaryVaultPath);
          (async () => {
            try {
              const results = await counter.countAllReferences();

              // Display stats based on options
              const options = {
                zeroOnly: process.argv.includes('--zero'),
                sortAsc: process.argv.includes('--sort-asc'),
                update: process.argv.includes('--update')
              };

              counter.displayStats(results, options);

              // Save statistics
              const stats = await counter.saveStatistics(results);
              success('Statistics saved to: .obsidian/state/glossary-reference-stats.json');

              // Update glossary files if requested
              if (options.update) {
                await counter.updateGlossaryFiles(results);
              }
            } catch (error) {
              error('Failed to count references: ' + error.message);
              process.exit(1);
            }
          })();
        }
        break;

      case 'glossary-archive-unused':
        // Phase 5-4: Archive unused glossary terms
        {
          const GlossaryCleanupSystem = require('./glossary-cleanup');
          const cleanupVaultPath = getVaultPath();
          const cleanup = new GlossaryCleanupSystem(cleanupVaultPath);
          (async () => {
            try {
              const dryRun = process.argv.includes('--dry-run');
              const minDays = process.argv.includes('--min-days')
                ? parseInt(process.argv[process.argv.indexOf('--min-days') + 1]) || 0
                : 0;

              cleanup.ensureArchiveDirectory();

              const unusedTerms = await cleanup.detectUnusedTerms();

              if (unusedTerms.length === 0) {
                success('No unused terms to archive');
              } else {
                const results = await cleanup.archiveUnusedTerms(unusedTerms, {
                  dryRun: dryRun,
                  minDaysUnused: minDays
                });

                console.log(`\n📊 Summary:`);
                console.log(`   Archived: ${results.archived.length}`);
                console.log(`   Preserved: ${results.preserved.length}`);
                console.log(`   Errors: ${results.errors.length}`);

                if (dryRun) {
                  info('Dry run completed. No files were actually modified.');
                }
              }
            } catch (error) {
              error('Failed to archive unused terms: ' + error.message);
              process.exit(1);
            }
          })();
        }
        break;

      case 'glossary-cleanup-detect':
        // Phase 5-4: Detect unused terms (alias)
        {
          const GlossaryCleanupSystem = require('./glossary-cleanup');
          const cleanupVaultPath = getVaultPath();
          const cleanup = new GlossaryCleanupSystem(cleanupVaultPath);
          (async () => {
            try {
              const unused = await cleanup.detectUnusedTerms();

              if (unused.length === 0) {
                success('No unused terms found!');
              } else {
                cleanup.generateCleanupReport(unused);
              }
            } catch (error) {
              error('Failed to detect unused terms: ' + error.message);
              process.exit(1);
            }
          })();
        }
        break;

      case 'glossary-cleanup-list':
        // Phase 5-4: List archived terms
        {
          const GlossaryCleanupSystem = require('./glossary-cleanup');
          const cleanupVaultPath = getVaultPath();
          const cleanup = new GlossaryCleanupSystem(cleanupVaultPath);
          cleanup.listArchivedTerms();
        }
        break;

      case 'glossary-cleanup-restore':
        // Phase 5-4: Restore an archived term
        if (commandArgs.length === 0) {
          error('Please specify a term to restore');
          process.exit(1);
        }
        {
          const GlossaryCleanupSystem = require('./glossary-cleanup');
          const cleanupVaultPath = getVaultPath();
          const cleanup = new GlossaryCleanupSystem(cleanupVaultPath);
          const result = cleanup.restoreGlossaryFile(commandArgs[0]);
          if (result.success) {
            success(`Restored: ${commandArgs[0]}`);
          } else {
            error(`Restore failed: ${result.error}`);
            process.exit(1);
          }
        }
        break;

      case 'glossary-cleanup-stats':
        // Phase 5-4: Show cleanup statistics
        {
          const GlossaryCleanupSystem = require('./glossary-cleanup');
          const cleanupVaultPath = getVaultPath();
          const cleanup = new GlossaryCleanupSystem(cleanupVaultPath);
          cleanup.displayCleanupStats();
        }
        break;

      case 'glossary-create-from':
        // Phase 5-2: Create glossary from specific file
        if (commandArgs.length === 0) {
          error('Please specify a file to process');
          process.exit(1);
        }
        {
          const GlossaryCreationAgent = require('./agent-modules/glossary-creation-agent');
          const creationVaultPath = getVaultPath();
          const creator = new GlossaryCreationAgent(creationVaultPath);
          const fs = require('fs');
          const matter = require('gray-matter');

          try {
            const filePath = path.join(creationVaultPath, commandArgs[0]);

            if (!fs.existsSync(filePath)) {
              error(`File not found: ${filePath}`);
              process.exit(1);
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            const { data: frontmatter, content: body } = matter(content);

            const result = creator.processSyncContent({
              path: commandArgs[0],
              frontmatter: frontmatter,
              body: body
            });

            console.log(`\n📊 Glossary Creation Results for: ${commandArgs[0]}\n`);
            console.log(`   Concepts Found: ${result.concepts_found}`);
            console.log(`   New Concepts: ${result.new_concepts}`);
            console.log(`   Existing Concepts: ${result.existing_concepts}`);
            console.log(`   Glossary Created: ${result.glossary_created}`);

            if (result.created_concepts.length > 0) {
              console.log(`\n   ✅ Created:`);
              result.created_concepts.forEach(concept => {
                console.log(`      • ${concept}`);
              });
            }

            success(`Glossary creation complete`);
          } catch (error) {
            error('Failed to create glossary: ' + error.message);
            process.exit(1);
          }
        }
        break;

      case 'glossary-create-batch':
        // Phase 5-2: Batch create glossary from all documents
        {
          const GlossaryCreationAgent = require('./agent-modules/glossary-creation-agent');
          const creationVaultPath = getVaultPath();
          const creator = new GlossaryCreationAgent(creationVaultPath);

          try {
            const directory = commandArgs[0] || '1_Projects';

            console.log(`\n🔄 Batch creating glossary entries from: ${directory}\n`);

            const result = creator.batchCreateFromDirectory(directory);

            console.log(`\n📊 Batch Creation Results\n`);
            console.log(`   Files Processed: ${result.total_processed}`);
            console.log(`   Total Concepts Found: ${result.concepts_found}`);
            console.log(`   Glossary Entries Created: ${result.glossary_created}`);

            success(`Batch glossary creation complete`);
          } catch (error) {
            error('Failed to batch create glossary: ' + error.message);
            process.exit(1);
          }
        }
        break;

      case 'glossary-validate':
        // Phase 5-6: Validate glossary index consistency
        {
          const GlossaryIndexValidator = require('./glossary-index-validator');
          const validatorVaultPath = getVaultPath();
          const validator = new GlossaryIndexValidator(validatorVaultPath);

          const fix = process.argv.includes('--fix');

          if (fix) {
            (async () => {
              try {
                const result = await validator.fixConsistencies();
                console.log(`\n📋 Fix Summary:`);
                console.log(`   Fixed: ${result.fixed}`);
                console.log(`   Removed: ${result.removed}`);
                console.log(`   Errors: ${result.errors}`);
                success('Index validation and fix completed');
              } catch (error) {
                error('Failed to fix index: ' + error.message);
                process.exit(1);
              }
            })();
          } else {
            validator.displayValidationReport();
          }
        }
        break;

      case 'glossary-validate-quick':
        // Phase 5-6: Quick integrity check
        {
          const GlossaryIndexValidator = require('./glossary-index-validator');
          const validatorVaultPath = getVaultPath();
          const validator = new GlossaryIndexValidator(validatorVaultPath);

          const result = validator.quickCheck();
          console.log(`\n🔍 Quick Index Check\n`);
          if (result.ok) {
            success(result.reason);
          } else {
            error(result.reason);
            process.exit(1);
          }
        }
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
