#!/usr/bin/env node

/**
 * AI Agent Knowledge Management System - Glossary Cleanup System
 *
 * Phase 5-4: Automatically archive or cleanup glossary terms with 0 references
 * - AI-generated terms: automatically archive to 4_Archives/unused-glossary/
 * - Manual terms: preserve but mark for review
 * - Maintains cleanup history and allows recovery
 *
 * Design Principle:
 * - Simple and reliable: File system is source of truth
 * - Preserve human-created content: Manual terms are never deleted
 * - AI content is ephemeral: Can be archived and recovered
 * - Transparent: All actions are logged and reversible
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const GlossaryReferenceCounter = require('./glossary-reference-counter');

class GlossaryCleanupSystem {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.glossaryPath = path.join(this.vaultPath, '5_Glossary');
    this.archivePath = path.join(this.vaultPath, '4_Archives/unused-glossary');
    this.cleanupLogPath = path.join(this.vaultPath, '.obsidian/state/cleanup-log.json');
    this.counter = new GlossaryReferenceCounter(vaultPath);
  }

  /**
   * Ensure archive directory exists
   */
  ensureArchiveDirectory() {
    if (!fs.existsSync(this.archivePath)) {
      fs.mkdirSync(this.archivePath, { recursive: true });
      console.log(`📁 Created archive directory: ${this.archivePath}`);
    }
  }

  /**
   * Detect unused terms (0 references)
   */
  async detectUnusedTerms() {
    console.log('🔍 Detecting unused terms...\n');

    const refData = await this.counter.countAllReferences();
    const unused = Object.entries(refData)
      .filter(([_, item]) => item.reference_count === 0)
      .map(([name, item]) => {
        const filePath = path.join(this.glossaryPath, `${name}.md`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);

        return {
          name: name,
          title: item.title,
          file: item.file,
          filePath: filePath,
          ai_generated: item.ai_generated || frontmatter.ai_generated || false,
          ai_generated_at: frontmatter.ai_generated_at,
          ai_updated_at: item.last_counted,
          daysUnused: this.calculateDaysUnused(frontmatter.ai_updated_at || frontmatter.ai_generated_at)
        };
      });

    return unused;
  }

  /**
   * Calculate days since term was created/updated
   */
  calculateDaysUnused(timestamp) {
    if (!timestamp) return -1;

    const createdDate = new Date(timestamp);
    const now = new Date();
    const diffTime = now - createdDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Archive a glossary file
   */
  archiveGlossaryFile(filePath, term) {
    try {
      const fileName = path.basename(filePath);
      const archiveFilePath = path.join(this.archivePath, fileName);

      // Copy file to archive
      fs.copyFileSync(filePath, archiveFilePath);

      // Delete from glossary
      fs.unlinkSync(filePath);

      return {
        success: true,
        term: term,
        archivedPath: archiveFilePath
      };
    } catch (error) {
      return {
        success: false,
        term: term,
        error: error.message
      };
    }
  }

  /**
   * Restore an archived glossary file
   */
  restoreGlossaryFile(term) {
    try {
      const archiveFilePath = path.join(this.archivePath, `${term}.md`);

      if (!fs.existsSync(archiveFilePath)) {
        return {
          success: false,
          term: term,
          error: `Archive file not found: ${archiveFilePath}`
        };
      }

      const glossaryFilePath = path.join(this.glossaryPath, `${term}.md`);

      // Copy back to glossary
      fs.copyFileSync(archiveFilePath, glossaryFilePath);

      // Delete from archive
      fs.unlinkSync(archiveFilePath);

      return {
        success: true,
        term: term,
        restoredPath: glossaryFilePath
      };
    } catch (error) {
      return {
        success: false,
        term: term,
        error: error.message
      };
    }
  }

  /**
   * Process unused terms - archive AI-generated, preserve manual
   */
  async archiveUnusedTerms(unused, options = {}) {
    const dryRun = options.dryRun || false;
    const minDaysUnused = options.minDaysUnused || 0; // 0 means archive immediately

    console.log(`\n${dryRun ? '🔍 DRY RUN: ' : ''}📦 Processing Unused Terms\n`);

    const aiGenerated = unused.filter(item => {
      const isOldEnough = item.daysUnused < 0 || item.daysUnused >= minDaysUnused;
      return item.ai_generated && isOldEnough;
    });

    const manual = unused.filter(item => !item.ai_generated);

    const results = {
      archived: [],
      preserved: [],
      errors: []
    };

    // Archive AI-generated terms
    console.log(`\n✅ Auto-archiving ${aiGenerated.length} AI-generated term(s):\n`);

    for (const item of aiGenerated) {
      const daysInfo = item.daysUnused >= 0 ? ` (${item.daysUnused} days unused)` : '';
      console.log(`   • ${item.title}${daysInfo}`);

      if (!dryRun) {
        const result = this.archiveGlossaryFile(item.filePath, item.name);
        if (result.success) {
          results.archived.push({
            term: item.name,
            title: item.title,
            archivedAt: new Date().toISOString(),
            daysUnused: item.daysUnused
          });
          console.log(`     ✓ Archived to: ${result.archivedPath}`);
        } else {
          results.errors.push({
            term: item.name,
            error: result.error
          });
          console.log(`     ✗ Error: ${result.error}`);
        }
      }
    }

    // Preserve manual terms
    if (manual.length > 0) {
      console.log(`\n⚡ Preserving ${manual.length} manual term(s) (user review recommended):\n`);

      for (const item of manual) {
        console.log(`   • ${item.title}`);
        results.preserved.push({
          term: item.name,
          title: item.title,
          flaggedAt: new Date().toISOString(),
          action: 'REVIEW_NEEDED'
        });
      }
    }

    // Log cleanup action
    if (!dryRun) {
      await this.logCleanupAction(results);
    }

    return results;
  }

  /**
   * Log cleanup action to history
   */
  async logCleanupAction(results) {
    let cleanupHistory = [];

    if (fs.existsSync(this.cleanupLogPath)) {
      try {
        cleanupHistory = JSON.parse(fs.readFileSync(this.cleanupLogPath, 'utf-8'));
      } catch (error) {
        console.warn('⚠️  Could not read existing cleanup log');
      }
    }

    cleanupHistory.push({
      timestamp: new Date().toISOString(),
      archived_count: results.archived.length,
      preserved_count: results.preserved.length,
      errors_count: results.errors.length,
      details: results
    });

    fs.writeFileSync(this.cleanupLogPath, JSON.stringify(cleanupHistory, null, 2), 'utf-8');
    console.log(`\n📝 Cleanup logged to: .obsidian/state/cleanup-log.json`);
  }

  /**
   * Generate cleanup report
   */
  generateCleanupReport(unusedTerms) {
    console.log('\n📊 Cleanup Report\n');
    console.log('┌──────────────────────────────────────┐');
    console.log(`│ Total Unused Terms: ${String(unusedTerms.length).padStart(20)} │`);
    console.log('└──────────────────────────────────────┘\n');

    const aiGenerated = unusedTerms.filter(t => t.ai_generated);
    const manual = unusedTerms.filter(t => !t.ai_generated);

    if (aiGenerated.length > 0) {
      console.log(`✅ Auto-archive candidates (${aiGenerated.length}):`);
      aiGenerated.forEach((t, i) => {
        const daysInfo = t.daysUnused >= 0 ? ` (${t.daysUnused}d)` : '';
        console.log(`   ${i + 1}. ${t.title}${daysInfo}`);
      });
    }

    if (manual.length > 0) {
      console.log(`\n⚡ Requires review (${manual.length}):`);
      manual.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.title}`);
      });
    }

    console.log('\n💡 Tips:');
    console.log('  - Use --dry-run to preview changes without archiving');
    console.log('  - Use --min-days N to archive only if unused for N+ days');
    console.log('  - Use glossary-restore <term> to recover archived terms');
  }

  /**
   * List archived terms
   */
  listArchivedTerms() {
    console.log('\n📦 Archived Glossary Terms\n');

    if (!fs.existsSync(this.archivePath)) {
      console.log('No archived terms found.');
      return [];
    }

    const archivedFiles = fs.readdirSync(this.archivePath)
      .filter(f => f.endsWith('.md'));

    if (archivedFiles.length === 0) {
      console.log('No archived terms found.');
      return [];
    }

    const archived = archivedFiles.map(fileName => {
      const filePath = path.join(this.archivePath, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter } = matter(fileContent);
      const stats = fs.statSync(filePath);

      return {
        name: fileName.replace('.md', ''),
        title: frontmatter.title || fileName,
        archivedDate: stats.birthtime,
        ai_generated: frontmatter.ai_generated || false
      };
    });

    // Display table
    console.log('┌─────────────────────────────┬──────────────────────┐');
    console.log('│ Term                        │ Archived Date        │');
    console.log('├─────────────────────────────┼──────────────────────┤');

    for (const item of archived) {
      const term = item.title.padEnd(27);
      const date = item.archivedDate.toISOString().substring(0, 19).padEnd(20);
      console.log(`│ ${term} │ ${date} │`);
    }

    console.log('└─────────────────────────────┴──────────────────────┘');
    console.log(`\nTotal: ${archived.length} archived term(s)`);

    return archived;
  }

  /**
   * Get cleanup statistics
   */
  getCleanupStats() {
    let stats = {
      total_cleanups: 0,
      total_archived: 0,
      total_preserved: 0,
      total_errors: 0,
      last_cleanup: null,
      archived_today: 0
    };

    if (fs.existsSync(this.cleanupLogPath)) {
      const cleanupHistory = JSON.parse(fs.readFileSync(this.cleanupLogPath, 'utf-8'));

      stats.total_cleanups = cleanupHistory.length;

      if (cleanupHistory.length > 0) {
        const lastCleanup = cleanupHistory[cleanupHistory.length - 1];
        stats.last_cleanup = lastCleanup.timestamp;
        stats.total_archived = cleanupHistory.reduce((sum, c) => sum + c.archived_count, 0);
        stats.total_preserved = cleanupHistory.reduce((sum, c) => sum + c.preserved_count, 0);
        stats.total_errors = cleanupHistory.reduce((sum, c) => sum + c.errors_count, 0);

        // Count today's archives
        const today = new Date().toISOString().split('T')[0];
        const todayCleanup = cleanupHistory.find(c => c.timestamp.startsWith(today));
        if (todayCleanup) {
          stats.archived_today = todayCleanup.archived_count;
        }
      }
    }

    return stats;
  }

  /**
   * Display cleanup statistics
   */
  displayCleanupStats() {
    const stats = this.getCleanupStats();

    console.log('\n📊 Glossary Cleanup Statistics\n');
    console.log('┌──────────────────────────────────────┐');
    console.log(`│ Total Cleanups: ${String(stats.total_cleanups).padStart(21)} │`);
    console.log(`│ Total Archived: ${String(stats.total_archived).padStart(21)} │`);
    console.log(`│ Total Preserved: ${String(stats.total_preserved).padStart(20)} │`);
    console.log(`│ Total Errors: ${String(stats.total_errors).padStart(23)} │`);
    console.log('└──────────────────────────────────────┘');

    if (stats.last_cleanup) {
      console.log(`\nLast Cleanup: ${stats.last_cleanup}`);
      console.log(`Archived Today: ${stats.archived_today}`);
    }
  }
}

module.exports = GlossaryCleanupSystem;

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'detect';
  const term = process.argv[3];

  const cleanup = new GlossaryCleanupSystem(process.cwd());

  (async () => {
    try {
      switch (command) {
        case 'detect':
          // Detect and report unused terms
          const unused = await cleanup.detectUnusedTerms();

          if (unused.length === 0) {
            console.log('✅ No unused terms found!');
          } else {
            cleanup.generateCleanupReport(unused);
          }
          break;

        case 'archive':
          // Archive unused terms
          const dryRun = process.argv.includes('--dry-run');
          const minDays = process.argv.includes('--min-days')
            ? parseInt(process.argv[process.argv.indexOf('--min-days') + 1]) || 0
            : 0;

          cleanup.ensureArchiveDirectory();

          const unusedTerms = await cleanup.detectUnusedTerms();

          if (unusedTerms.length === 0) {
            console.log('✅ No unused terms to archive');
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
              console.log(`\n✨ Dry run completed. No files were actually modified.`);
            }
          }
          break;

        case 'list':
          // List archived terms
          cleanup.listArchivedTerms();
          break;

        case 'restore':
          // Restore an archived term
          if (!term) {
            console.error('❌ Please specify a term to restore');
            process.exit(1);
          }

          const result = cleanup.restoreGlossaryFile(term);
          if (result.success) {
            console.log(`✅ Restored: ${term}`);
            console.log(`   From: ${result.restoredPath}`);
          } else {
            console.error(`❌ Restore failed: ${result.error}`);
            process.exit(1);
          }
          break;

        case 'stats':
          // Show cleanup statistics
          cleanup.displayCleanupStats();
          break;

        default:
          console.log('Usage: node glossary-cleanup.js <command> [options]');
          console.log('\nCommands:');
          console.log('  detect    - Detect unused terms (0 references)');
          console.log('  archive   - Archive unused terms');
          console.log('  list      - List archived terms');
          console.log('  restore <term> - Restore an archived term');
          console.log('  stats     - Show cleanup statistics');
          console.log('\nOptions:');
          console.log('  --dry-run         - Preview changes without archiving');
          console.log('  --min-days N      - Archive only if unused for N+ days');
          console.log('\nExamples:');
          console.log('  node glossary-cleanup.js detect');
          console.log('  node glossary-cleanup.js archive --dry-run');
          console.log('  node glossary-cleanup.js archive --min-days 30');
          console.log('  node glossary-cleanup.js restore "old-term"');
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
