#!/usr/bin/env node

/**
 * Phase 5 Integration Tests
 *
 * Tests for CLI interface and Git hook integration
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✅ PASS${colors.reset} ${name}`);
    testsPassed++;
  } catch (err) {
    console.log(`${colors.red}❌ FAIL${colors.reset} ${name}`);
    console.log(`   ${colors.red}${err.message}${colors.reset}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertExists(filePath, message) {
  assert(fs.existsSync(filePath), message || `File should exist: ${filePath}`);
}

function assertNotExists(filePath, message) {
  assert(!fs.existsSync(filePath), message || `File should not exist: ${filePath}`);
}

console.log(`\n${colors.cyan}🧪 Phase 5 Integration Tests${colors.reset}\n`);

const vaultPath = path.resolve(__dirname, '../..');
const scriptsPath = __dirname;

// Test 1: CLI script exists
test('CLI script exists', () => {
  const cliPath = path.join(scriptsPath, 'cli.js');
  assertExists(cliPath, 'cli.js should exist');
});

// Test 2: CLI help command works
test('CLI help command works', () => {
  try {
    const output = execSync('node cli.js help', {
      cwd: scriptsPath,
      encoding: 'utf-8'
    });
    assert(output.includes('USAGE:'), 'Help output should contain USAGE');
    assert(output.includes('COMMANDS:'), 'Help output should contain COMMANDS');
  } catch (err) {
    throw new Error(`CLI help failed: ${err.message}`);
  }
});

// Test 3: CLI version command works
test('CLI version command works', () => {
  try {
    const output = execSync('node cli.js version', {
      cwd: scriptsPath,
      encoding: 'utf-8'
    });
    assert(output.includes('Version:'), 'Version output should contain Version');
    assert(output.includes('Phase:'), 'Version output should contain Phase');
  } catch (err) {
    throw new Error(`CLI version failed: ${err.message}`);
  }
});

// Test 4: Git commit handler exists
test('Git commit handler exists', () => {
  const handlerPath = path.join(scriptsPath, 'git-commit-handler.js');
  assertExists(handlerPath, 'git-commit-handler.js should exist');
});

// Test 5: Git commit handler can be required
test('Git commit handler can be required', () => {
  try {
    const GitCommitHandler = require('./git-commit-handler');
    assert(typeof GitCommitHandler === 'function', 'Should export a class');
  } catch (err) {
    throw new Error(`Failed to require git-commit-handler: ${err.message}`);
  }
});

// Test 6: Git hook installer exists
test('Git hook installer exists', () => {
  const installerPath = path.join(scriptsPath, 'install-git-hook.js');
  assertExists(installerPath, 'install-git-hook.js should exist');
});

// Test 7: Git hook installer can check status
test('Git hook installer can check status', () => {
  try {
    const output = execSync('node install-git-hook.js status', {
      cwd: scriptsPath,
      encoding: 'utf-8'
    });
    assert(output.includes('Git Hook Status'), 'Should show status header');
    assert(output.includes('Repository:'), 'Should show repository status');
  } catch (err) {
    throw new Error(`Hook status check failed: ${err.message}`);
  }
});

// Test 8: Git hook is installed
test('Git hook is installed', () => {
  try {
    const output = execSync('node install-git-hook.js status', {
      cwd: scriptsPath,
      encoding: 'utf-8'
    });
    assert(output.includes('✅'), 'Repository should be found');
  } catch (err) {
    throw new Error(`Hook not properly installed: ${err.message}`);
  }
});

// Test 9: CLI has all main command categories
test('CLI has all main command categories', () => {
  try {
    const output = execSync('node cli.js help', {
      cwd: scriptsPath,
      encoding: 'utf-8'
    });

    assert(output.includes('Queue Management:'), 'Should have Queue Management');
    assert(output.includes('Glossary Management:'), 'Should have Glossary Management');
    assert(output.includes('Filing Rules:'), 'Should have Filing Rules');
    assert(output.includes('File Watcher:'), 'Should have File Watcher');
    assert(output.includes('System Maintenance:'), 'Should have System Maintenance');
  } catch (err) {
    throw new Error(`CLI categories missing: ${err.message}`);
  }
});

// Test 10: CLI has essential commands
test('CLI has essential commands', () => {
  try {
    const output = execSync('node cli.js help', {
      cwd: scriptsPath,
      encoding: 'utf-8'
    });

    const essentialCommands = [
      'process-next',
      'process-all',
      'status',
      'glossary-build',
      'glossary-search',
      'rules-list',
      'watch',
      'clean',
      'help',
      'version'
    ];

    essentialCommands.forEach(cmd => {
      assert(output.includes(cmd), `Should have ${cmd} command`);
    });
  } catch (err) {
    throw new Error(`Essential commands missing: ${err.message}`);
  }
});

// Test 11: README.md has Phase 5 documentation
test('README.md has Phase 5 documentation', () => {
  const readmePath = path.join(scriptsPath, 'README.md');
  assertExists(readmePath, 'README.md should exist');

  const content = fs.readFileSync(readmePath, 'utf-8');
  assert(content.includes('Phase 5'), 'README should mention Phase 5');
  assert(content.includes('CLI'), 'README should mention CLI');
  assert(content.includes('Git Hook'), 'README should mention Git Hook');
  assert(content.includes('1.2.0'), 'Version should be updated to 1.2.0');
});

// Test 12: README has CLI examples
test('README has CLI usage examples', () => {
  const readmePath = path.join(scriptsPath, 'README.md');
  const content = fs.readFileSync(readmePath, 'utf-8');

  assert(content.includes('node cli.js'), 'Should have CLI examples');
  assert(content.includes('install-git-hook.js'), 'Should have hook installation examples');
});

// Test 13: Git commit handler has proper methods
test('Git commit handler has proper methods', () => {
  const GitCommitHandler = require('./git-commit-handler');
  const instance = new GitCommitHandler(vaultPath);

  assert(typeof instance.getLatestCommit === 'function', 'Should have getLatestCommit method');
  assert(typeof instance.getCommit === 'function', 'Should have getCommit method');
  assert(typeof instance.createCommitDocument === 'function', 'Should have createCommitDocument method');
  assert(typeof instance.processLatestCommit === 'function', 'Should have processLatestCommit method');
});

// Test 14: CLI module exports
test('CLI module has proper exports', () => {
  const cli = require('./cli');

  assert(typeof cli.main === 'function', 'Should export main function');
  assert(typeof cli.showHelp === 'function', 'Should export showHelp function');
  assert(typeof cli.showVersion === 'function', 'Should export showVersion function');
});

// Test 15: Hook installer has proper methods
test('Hook installer has proper methods', () => {
  const GitHookInstaller = require('./install-git-hook');
  const instance = new GitHookInstaller(vaultPath);

  assert(typeof instance.isGitRepository === 'function', 'Should have isGitRepository method');
  assert(typeof instance.isHookInstalled === 'function', 'Should have isHookInstalled method');
  assert(typeof instance.install === 'function', 'Should have install method');
  assert(typeof instance.uninstall === 'function', 'Should have uninstall method');
  assert(typeof instance.status === 'function', 'Should have status method');
});

// Summary
console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.cyan}Test Summary${colors.reset}`);
console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
console.log(`Total:  ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log(`\n${colors.green}✅ All Phase 5 tests passed!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}❌ Some tests failed${colors.reset}\n`);
  process.exit(1);
}
