const WorkQueueManager = require('./queue-manager');
const path = require('path');

const vaultPath = 'd:\\jjumV\\jjum';
const queueManager = new WorkQueueManager(vaultPath);

const testFiles = [
  path.join(vaultPath, '00_Inbox', 'test-batch-1.md'),
  path.join(vaultPath, '00_Inbox', 'test-batch-2.md'),
  path.join(vaultPath, '00_Inbox', 'test-batch-3.md')
];

(async () => {
  console.log('Adding test files to work queue...\n');

  for (const filePath of testFiles) {
    try {
      await queueManager.addToQueue(filePath);
      console.log(`✅ Added: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`❌ Failed to add ${path.basename(filePath)}: ${error.message}`);
    }
  }

  const stats = await queueManager.getStats();
  console.log(`\n📊 Queue Statistics:`);
  console.log(`   Total items: ${stats.total_items}`);
  console.log(`   By type:`, stats.by_type);
  console.log(`   By priority:`, stats.by_priority);
})();
