const ProcessingManifest = require('./processing-manifest');
const WorkQueueManager = require('./queue-manager');
const path = require('path');
const fs = require('fs');

const vaultPath = 'd:\\jjumV\\jjum';
const manifest = new ProcessingManifest(vaultPath);
const queueManager = new WorkQueueManager(vaultPath);

/**
 * Create a test file and add a simulated failed processing task
 */
(async () => {
  console.log('🧪 Simulating a failed processing task...\n');

  // Create a test file
  const testFilePath = path.join(vaultPath, '00_Inbox', 'test-recovery.md');
  const testContent = `# Test Recovery Document

This is a test document to simulate recovery processing.

It contains some content about Node.js and JavaScript for testing purposes.

## Example Code

\`\`\`javascript
console.log('Hello, recovery test!');
\`\`\`
`;

  await fs.promises.writeFile(testFilePath, testContent, 'utf-8');
  console.log(`✅ Created test file: ${testFilePath}`);

  // Add to work queue
  await queueManager.addToQueue(testFilePath);
  console.log(`✅ Added to work queue`);

  // Get the work item
  const workItem = await queueManager.getNext();
  await queueManager.startProcessing(workItem.id);
  console.log(`✅ Started processing (ID: ${workItem.id})`);

  // Add to processing manifest with partial completion
  const processingItem = {
    work_id: workItem.id,
    file_path: testFilePath,
    type: workItem.type,
    priority: workItem.priority,
    started_at: new Date().toISOString(),
    retry_count: 0,
    agent_pipeline: [
      {
        name: 'normalization',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: 5,
        result: { status: 'completed' }
      },
      {
        name: 'keyword-extraction',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: 15,
        result: { status: 'completed' }
      },
      {
        name: 'linking',
        status: 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: 2,
        result: {
          status: 'failed',
          error: 'Simulated network timeout',
          stack: 'Error: Simulated network timeout\n    at simulate-failure.js'
        }
      },
      {
        name: 'filing',
        status: 'pending',
        started_at: null,
        completed_at: null,
        duration_ms: null,
        result: null
      }
    ]
  };

  // Manually add to manifest
  const manifestPath = path.join(vaultPath, '.obsidian/state/processing-manifest.json');
  const manifestData = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));

  manifestData.current_processing.push(processingItem);
  manifestData.last_updated = new Date().toISOString();

  await fs.promises.writeFile(manifestPath, JSON.stringify(manifestData, null, 2), 'utf-8');

  console.log(`✅ Added to processing manifest with simulated failure`);
  console.log(`\n📋 Failure Details:`);
  console.log(`   Work ID: ${workItem.id}`);
  console.log(`   File: ${testFilePath}`);
  console.log(`   Completed agents: normalization, keyword-extraction`);
  console.log(`   Failed agent: linking (Simulated network timeout)`);
  console.log(`   Pending agents: filing`);
  console.log(`\n✅ Simulation complete! You can now run recovery-processor.js`);
})();
