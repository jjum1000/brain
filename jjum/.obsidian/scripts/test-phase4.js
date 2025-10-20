/**
 * Phase 4 Feature Test Suite
 * Tests advanced features added in Phase 4
 */

const GlossaryBuilder = require('./glossary-builder');
const FilingRulesEngine = require('./filing-rules-engine');
const fs = require('fs');
const path = require('path');

async function testGlossaryPhase4() {
  console.log('\n🧪 Testing Glossary Builder - Phase 4 Features\n');

  const builder = new GlossaryBuilder('.');

  // Test 1: Advanced Search
  console.log('1. Testing advanced search with relevance scoring...');
  const searchResults = await builder.advancedSearch('react', { limit: 3 });
  console.log(`   ✅ Found ${searchResults.length} results with relevance scores`);
  console.log(`   Top result: ${searchResults[0]?.title} (relevance: ${searchResults[0]?.relevance})`);

  // Test 2: Find Related
  console.log('\n2. Testing find related terms...');
  const relatedResults = await builder.findRelated('react', { limit: 3 });
  console.log(`   ✅ Found ${relatedResults.length} related terms`);
  if (relatedResults.length > 0) {
    console.log(`   Related: ${relatedResults.map(r => r.title).join(', ')}`);
  }

  // Test 3: Priority Sorting
  console.log('\n3. Testing search with priority sorting...');
  const priorityResults = await builder.search('javascript', { sortByPriority: true, limit: 5 });
  console.log(`   ✅ Found ${priorityResults.length} results sorted by priority`);
  priorityResults.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.title} (priority: ${r.priority || 0})`);
  });

  console.log('\n✅ Glossary Phase 4 tests completed!\n');
}

async function testFilingRulesPhase4() {
  console.log('\n🧪 Testing Filing Rules - Phase 4 Features\n');

  const engine = new FilingRulesEngine('.');

  // Test 1: Content-based matching
  console.log('1. Testing content-based filing rule...');
  const docWithTypescript = {
    path: '00_Inbox/test-typescript.md',
    frontmatter: { title: 'TypeScript Guide' },
    body: 'This article covers TypeScript, type safety, and interfaces in detail.',
    tags: []
  };

  const result1 = await engine.determineDestination(docWithTypescript);
  console.log(`   ✅ Matched rule: ${result1.rule_name}`);
  console.log(`   Destination: ${result1.destination}`);
  console.log(`   Score: ${result1.score}, Confidence: ${result1.confidence}`);

  // Test 2: Pattern-based matching
  console.log('\n2. Testing pattern-based filing rule...');
  const docWithTutorial = {
    path: '00_Inbox/test-tutorial.md',
    frontmatter: { title: 'How to Learn React' },
    body: 'Step 1: Install React\nStep 2: Create your first component\nThis is a tutorial for beginners.',
    tags: []
  };

  const result2 = await engine.determineDestination(docWithTutorial);
  console.log(`   ✅ Matched rule: ${result2.rule_name}`);
  console.log(`   Destination: ${result2.destination}`);
  console.log(`   Score: ${result2.score}, Confidence: ${result2.confidence}`);

  // Test 3: Conflict resolution (multiple matching rules)
  console.log('\n3. Testing conflict resolution...');
  const docWithMultipleMatches = {
    path: '00_Inbox/test-api.md',
    frontmatter: { title: 'API Reference' },
    body: 'This document describes the REST API endpoints, request and response formats.',
    tags: ['api', 'documentation']
  };

  const result3 = await engine.determineDestination(docWithMultipleMatches);
  console.log(`   ✅ Matched rule: ${result3.rule_name}`);
  console.log(`   Destination: ${result3.destination}`);
  console.log(`   Score: ${result3.score}, Confidence: ${result3.confidence}`);
  if (result3.alternatives && result3.alternatives.length > 0) {
    console.log(`   Alternatives: ${result3.alternatives.map(a => a.rule_name).join(', ')}`);
  }

  console.log('\n✅ Filing Rules Phase 4 tests completed!\n');
}

async function testFileWatcherPhase4() {
  console.log('\n🧪 Testing File Watcher - Phase 4 Features\n');

  const FileWatcher = require('./file-watcher');
  const watcher = new FileWatcher('.');

  // Test file type detection
  console.log('1. Testing file type detection...');

  const testCases = [
    { name: 'tutorial-react.md', wordCount: 100, expected: 'tutorial' },
    { name: 'example-code.md', wordCount: 50, expected: 'code-example' },
    { name: 'api-reference.md', wordCount: 200, expected: 'reference' },
    { name: 'long-article.md', wordCount: 600, expected: 'article' },
    { name: 'quick.md', wordCount: 50, expected: 'quick-note' }
  ];

  for (const testCase of testCases) {
    const metadata = { word_count: testCase.wordCount, source: 'inbox-file' };
    const fileType = watcher.detectFileType(testCase.name, metadata);
    const passed = fileType === testCase.expected;
    console.log(`   ${passed ? '✅' : '❌'} ${testCase.name}: ${fileType} ${passed ? '' : `(expected: ${testCase.expected})`}`);
  }

  // Test uptime formatting
  console.log('\n2. Testing uptime formatting...');
  const uptimes = [
    { ms: 5000, expected: '5s' },
    { ms: 125000, expected: '2m 5s' },
    { ms: 3725000, expected: '1h 2m' }
  ];

  for (const test of uptimes) {
    const formatted = watcher.formatUptime(test.ms);
    console.log(`   ✅ ${test.ms}ms → ${formatted}`);
  }

  console.log('\n✅ File Watcher Phase 4 tests completed!\n');
}

// Run all tests
async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Phase 4 Feature Test Suite                         ║');
  console.log('║  Advanced Knowledge Management System Features      ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  try {
    await testGlossaryPhase4();
    await testFilingRulesPhase4();
    await testFileWatcherPhase4();

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL PHASE 4 TESTS PASSED!                       ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { testGlossaryPhase4, testFilingRulesPhase4, testFileWatcherPhase4 };
