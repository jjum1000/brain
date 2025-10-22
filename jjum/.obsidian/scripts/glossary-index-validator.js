#!/usr/bin/env node

/**
 * AI Agent Knowledge Management System - Glossary Index Validator
 *
 * Phase 5-6: Validates and maintains consistency between
 * glossary index and actual files on disk.
 *
 * Design Principle:
 * - File system is source of truth
 * - Index is a cache that can be rebuilt
 * - Real-time validation on find operations
 * - Automatic detection and correction of inconsistencies
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class GlossaryIndexValidator {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.glossaryPath = path.join(this.vaultPath, '5_Glossary');
    this.indexPath = path.join(this.vaultPath, '.obsidian/state/glossary-index.json');
    this.archivePath = path.join(this.vaultPath, '4_Archives/unused-glossary');
  }

  /**
   * Load glossary index
   */
  loadIndex() {
    if (!fs.existsSync(this.indexPath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
    } catch (error) {
      console.warn(`⚠️  Could not load index: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all actual glossary files from disk
   */
  getActualGlossaryFiles() {
    const files = new Map();

    if (!fs.existsSync(this.glossaryPath)) {
      return files;
    }

    const entries = fs.readdirSync(this.glossaryPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const filePath = path.join(this.glossaryPath, entry.name);
        const relativePath = path.relative(this.vaultPath, filePath).replace(/\\/g, '/');

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const { data: frontmatter } = matter(content);

          const title = frontmatter.title || entry.name.replace('.md', '');

          files.set(title.toLowerCase(), {
            file: relativePath,
            title: title,
            filePath: filePath,
            exists: true
          });
        } catch (error) {
          console.warn(`⚠️  Could not read file ${filePath}: ${error.message}`);
        }
      }
    }

    return files;
  }

  /**
   * Get all indexed glossary items
   */
  getIndexedItems() {
    const index = this.loadIndex();

    if (!index || !index.items) {
      return new Map();
    }

    const items = new Map();

    for (const item of index.items) {
      const key = item.title.toLowerCase();
      items.set(key, item);
    }

    return items;
  }

  /**
   * Validate index consistency
   */
  validateConsistency() {
    console.log('🔍 Validating Glossary Index Consistency...\n');

    const actualFiles = this.getActualGlossaryFiles();
    const indexedItems = this.getIndexedItems();

    const issues = {
      missingFiles: [],      // In index but file doesn't exist
      orphanedFiles: [],     // File exists but not in index
      pathMismatches: [],    // File exists but index has wrong path
      invalidEntries: []     // Index entry is malformed
    };

    // Check for missing files (indexed but no file on disk)
    for (const [key, item] of indexedItems.entries()) {
      if (!actualFiles.has(key)) {
        // Check if file really exists at the path listed in index
        const fullPath = path.join(this.vaultPath, item.file);
        if (!fs.existsSync(fullPath)) {
          issues.missingFiles.push({
            title: item.title,
            file: item.file,
            id: item.id
          });
        }
      }
    }

    // Check for orphaned files (file exists but not indexed)
    for (const [key, file] of actualFiles.entries()) {
      if (!indexedItems.has(key)) {
        issues.orphanedFiles.push({
          title: file.title,
          file: file.file,
          filePath: file.filePath
        });
      }
    }

    // Check for path mismatches
    for (const [key, actualFile] of actualFiles.entries()) {
      const indexed = indexedItems.get(key);
      if (indexed && indexed.file !== actualFile.file) {
        issues.pathMismatches.push({
          title: actualFile.title,
          indexedPath: indexed.file,
          actualPath: actualFile.file
        });
      }
    }

    return {
      totalActualFiles: actualFiles.size,
      totalIndexedItems: indexedItems.size,
      issues: issues,
      hasIssues: Object.values(issues).some(arr => arr.length > 0)
    };
  }

  /**
   * Fix consistency issues automatically
   */
  async fixConsistencies() {
    console.log('🔧 Fixing Index Inconsistencies...\n');

    const validation = this.validateConsistency();

    if (!validation.hasIssues) {
      console.log('✅ No consistency issues found!');
      return {
        fixed: 0,
        removed: 0,
        errors: 0
      };
    }

    const index = this.loadIndex();
    let removed = 0;
    let fixed = 0;
    let errors = 0;

    // Fix missing files: remove from index
    if (validation.issues.missingFiles.length > 0) {
      console.log(`\n🗑️  Removing ${validation.issues.missingFiles.length} entries for missing files:\n`);

      for (const item of validation.issues.missingFiles) {
        console.log(`   • ${item.title}`);

        // Remove from items array
        if (index.items) {
          index.items = index.items.filter(i => i.id !== item.id);
        }

        // Remove from title_map
        if (index.title_map) {
          const keys = Object.keys(index.title_map).filter(k =>
            index.title_map[k] === item.file
          );
          keys.forEach(k => delete index.title_map[k]);
        }

        // Remove from alias_map
        if (index.alias_map) {
          const keys = Object.keys(index.alias_map).filter(k =>
            index.alias_map[k] === item.file
          );
          keys.forEach(k => delete index.alias_map[k]);
        }

        removed++;
      }
    }

    // Fix path mismatches: update paths in index
    if (validation.issues.pathMismatches.length > 0) {
      console.log(`\n🔄 Fixing ${validation.issues.pathMismatches.length} path mismatches:\n`);

      for (const mismatch of validation.issues.pathMismatches) {
        console.log(`   • ${mismatch.title}`);
        console.log(`     Old: ${mismatch.indexedPath}`);
        console.log(`     New: ${mismatch.actualPath}`);

        // Update in items array
        if (index.items) {
          const item = index.items.find(i => i.title === mismatch.title);
          if (item) {
            item.file = mismatch.actualPath;
            fixed++;
          }
        }

        // Update maps
        if (index.title_map) {
          const titleLower = mismatch.title.toLowerCase();
          index.title_map[titleLower] = mismatch.actualPath;
        }

        if (index.alias_map) {
          const keys = Object.keys(index.alias_map).filter(k =>
            index.alias_map[k] === mismatch.indexedPath
          );
          keys.forEach(k => {
            index.alias_map[k] = mismatch.actualPath;
          });
        }
      }
    }

    // Fix orphaned files: rebuild index to add them
    if (validation.issues.orphanedFiles.length > 0) {
      console.log(`\n✨ Adding ${validation.issues.orphanedFiles.length} orphaned files to index:\n`);

      for (const file of validation.issues.orphanedFiles) {
        console.log(`   • ${file.title}`);

        try {
          const content = fs.readFileSync(file.filePath, 'utf-8');
          const { data: frontmatter } = matter(content);

          const newItem = {
            id: file.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            file: file.file,
            title: file.title,
            aliases: [file.title, file.title.toLowerCase()],
            synonyms: frontmatter.synonyms || [],
            tags: frontmatter.tags || [],
            related_concepts: frontmatter.related_concepts || [],
            priority: frontmatter.priority || 0,
            created: frontmatter.created || null,
            modified: frontmatter.modified || null
          };

          // Add to items
          if (index.items) {
            index.items.push(newItem);
          }

          // Add to title_map
          if (index.title_map) {
            index.title_map[file.title.toLowerCase()] = file.file;
          }

          // Add to alias_map
          if (index.alias_map) {
            const aliases = newItem.aliases || [];
            aliases.forEach(alias => {
              index.alias_map[alias.toLowerCase()] = file.file;
            });
          }

          fixed++;
        } catch (error) {
          console.error(`     ❌ Error processing ${file.title}: ${error.message}`);
          errors++;
        }
      }
    }

    // Save updated index
    try {
      index.built_at = new Date().toISOString();
      fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2), 'utf-8');
      console.log(`\n✅ Index updated and saved`);
    } catch (error) {
      console.error(`❌ Failed to save index: ${error.message}`);
      errors++;
    }

    return {
      fixed: fixed,
      removed: removed,
      errors: errors
    };
  }

  /**
   * Display validation report
   */
  displayValidationReport() {
    const validation = this.validateConsistency();

    console.log('\n📊 Glossary Index Validation Report\n');
    console.log('┌──────────────────────────────────────┐');
    console.log(`│ Actual Files: ${String(validation.totalActualFiles).padStart(24)} │`);
    console.log(`│ Indexed Items: ${String(validation.totalIndexedItems).padStart(23)} │`);
    console.log('└──────────────────────────────────────┘');

    if (!validation.hasIssues) {
      console.log('\n✅ Perfect consistency! No issues found.');
      return;
    }

    // Report issues
    console.log('\n⚠️  Issues Found:\n');

    if (validation.issues.missingFiles.length > 0) {
      console.log(`❌ Missing Files (${validation.issues.missingFiles.length}):`);
      validation.issues.missingFiles.forEach(item => {
        console.log(`   • ${item.title} (${item.file})`);
      });
    }

    if (validation.issues.orphanedFiles.length > 0) {
      console.log(`\n📁 Orphaned Files (${validation.issues.orphanedFiles.length}):`);
      validation.issues.orphanedFiles.forEach(item => {
        console.log(`   • ${item.title}`);
      });
    }

    if (validation.issues.pathMismatches.length > 0) {
      console.log(`\n🔀 Path Mismatches (${validation.issues.pathMismatches.length}):`);
      validation.issues.pathMismatches.forEach(item => {
        console.log(`   • ${item.title}`);
        console.log(`     Indexed: ${item.indexedPath}`);
        console.log(`     Actual: ${item.actualPath}`);
      });
    }

    console.log('\n💡 Tips:');
    console.log('  - Use "node cli.js glossary-validate --fix" to auto-fix issues');
    console.log('  - Use "node cli.js glossary-build" for complete rebuild');
  }

  /**
   * Real-time validation wrapper (for use in find operations)
   */
  validateBeforeFind(keyword) {
    const index = this.loadIndex();

    if (!index || !index.title_map) {
      return { valid: false, needsRebuild: true };
    }

    const normalizedKeyword = keyword.toLowerCase();
    const filePath = index.title_map[normalizedKeyword];

    if (!filePath) {
      return { valid: false, needsRebuild: false };
    }

    // Check if file exists
    const fullPath = path.join(this.vaultPath, filePath);

    if (!fs.existsSync(fullPath)) {
      return { valid: false, needsRebuild: true };
    }

    return { valid: true, filePath: filePath };
  }

  /**
   * Quick check of critical index integrity
   */
  quickCheck() {
    const index = this.loadIndex();

    if (!index) {
      return { ok: false, reason: 'Index file not found' };
    }

    if (!index.items || !Array.isArray(index.items)) {
      return { ok: false, reason: 'Index items array is missing or invalid' };
    }

    if (!index.title_map || typeof index.title_map !== 'object') {
      return { ok: false, reason: 'Title map is missing or invalid' };
    }

    if (!index.alias_map || typeof index.alias_map !== 'object') {
      return { ok: false, reason: 'Alias map is missing or invalid' };
    }

    // Check for missing files
    let missingCount = 0;

    for (const item of index.items) {
      const fullPath = path.join(this.vaultPath, item.file);
      if (!fs.existsSync(fullPath)) {
        missingCount++;
      }
    }

    if (missingCount > 0) {
      return {
        ok: false,
        reason: `${missingCount} files referenced in index but missing from disk`
      };
    }

    return { ok: true, reason: 'Index is consistent' };
  }
}

module.exports = GlossaryIndexValidator;

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'validate';

  const validator = new GlossaryIndexValidator(process.cwd());

  (async () => {
    try {
      switch (command) {
        case 'validate':
          validator.displayValidationReport();
          break;

        case 'quick-check':
          const result = validator.quickCheck();
          console.log(`\n🔍 Quick Index Check\n`);
          if (result.ok) {
            console.log(`✅ ${result.reason}`);
          } else {
            console.log(`❌ ${result.reason}`);
          }
          break;

        case 'fix':
          const fixResults = await validator.fixConsistencies();
          console.log(`\n📋 Fix Summary:`);
          console.log(`   Fixed: ${fixResults.fixed}`);
          console.log(`   Removed: ${fixResults.removed}`);
          console.log(`   Errors: ${fixResults.errors}`);
          break;

        default:
          console.log('Usage: node glossary-index-validator.js [command]');
          console.log('\nCommands:');
          console.log('  validate     - Validate index consistency (default)');
          console.log('  quick-check  - Quick integrity check');
          console.log('  fix          - Auto-fix inconsistencies');
          console.log('\nExamples:');
          console.log('  node glossary-index-validator.js validate');
          console.log('  node glossary-index-validator.js quick-check');
          console.log('  node glossary-index-validator.js fix');
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
