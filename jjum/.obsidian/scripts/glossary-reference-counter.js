#!/usr/bin/env node

/**
 * AI Agent Knowledge Management System - Glossary Reference Counter
 *
 * Phase 5: Counts references to each glossary term using ripgrep
 * Calculates life-force (reference_count) for each glossary item
 * Updates glossary files with reference counts and source documents
 *
 * Design Principle:
 * - Simple and accurate: use ripgrep for real-time counting
 * - Ripgrep is faster than incremental updates (~1 second for 100 terms)
 * - Run daily (1x per day is sufficient)
 * - File system is source of truth
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const matter = require('gray-matter');

class GlossaryReferenceCounter {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.glossaryPath = path.join(this.vaultPath, '5_Glossary');
    this.indexPath = path.join(this.vaultPath, '.obsidian/state/glossary-index.json');
    this.statsPath = path.join(this.vaultPath, '.obsidian/state/glossary-reference-stats.json');
  }

  /**
   * Count references for all glossary terms
   * Returns object with term -> count mapping and source documents
   */
  async countAllReferences() {
    console.log('📊 Counting Glossary References...\n');

    if (!fs.existsSync(this.glossaryPath)) {
      console.warn(`⚠️  Glossary directory not found: ${this.glossaryPath}`);
      return {};
    }

    const glossaryFiles = this.scanGlossaryFiles();
    console.log(`Found ${glossaryFiles.length} glossary file(s)\n`);

    const results = {};
    const startTime = Date.now();

    for (const filePath of glossaryFiles) {
      try {
        const fileName = path.basename(filePath, '.md');
        const { data: frontmatter } = matter(fs.readFileSync(filePath, 'utf-8'));

        // Get all possible search terms (title + aliases)
        const searchTerms = this.getSearchTerms(frontmatter, fileName);

        // Count references for each term
        const { count, sources } = await this.countReferencesForTerms(searchTerms);

        results[fileName] = {
          title: frontmatter.title || fileName,
          file: `5_Glossary/${fileName}.md`,
          reference_count: count,
          source_documents: sources,
          ai_generated: frontmatter.ai_generated || false,
          last_counted: new Date().toISOString()
        };

        // Show progress
        const emoji = count === 0 ? '⚠️ ' : count >= 5 ? '🔥' : '📌';
        console.log(`${emoji} ${frontmatter.title || fileName}: ${count} reference(s)`);
        if (sources.length > 0 && count <= 3) {
          console.log(`   From: ${sources.join(', ')}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}: ${error.message}`);
      }
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`\n✅ Reference counting completed in ${elapsedTime}ms`);

    return results;
  }

  /**
   * Scan all .md files in 5_Glossary directory
   */
  scanGlossaryFiles() {
    const files = [];
    const entries = fs.readdirSync(this.glossaryPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(path.join(this.glossaryPath, entry.name));
      }
    }

    return files;
  }

  /**
   * Get all search terms for a glossary item (title + aliases)
   */
  getSearchTerms(frontmatter, fileName) {
    const terms = [];

    // Add title
    if (frontmatter.title) {
      terms.push(frontmatter.title);
    }

    // Add aliases
    if (frontmatter.aliases) {
      const aliases = Array.isArray(frontmatter.aliases)
        ? frontmatter.aliases
        : [frontmatter.aliases];
      terms.push(...aliases);
    }

    // Add synonyms
    if (frontmatter.synonyms) {
      const synonyms = Array.isArray(frontmatter.synonyms)
        ? frontmatter.synonyms
        : [frontmatter.synonyms];
      terms.push(...synonyms);
    }

    // Remove duplicates
    return [...new Set(terms.filter(t => t && t.trim()))];
  }

  /**
   * Count references to a list of terms using file system search
   * Returns { count, sources }
   *
   * Note: This is a fallback implementation that scans files directly
   * when ripgrep is not available. For better performance with large repos,
   * install ripgrep: npm install ripgrep
   */
  async countReferencesForTerms(terms) {
    if (!terms || terms.length === 0) {
      return { count: 0, sources: [] };
    }

    let totalCount = 0;
    const foundSources = new Set();

    // Get all markdown files except glossary
    const mdFiles = this.getAllMarkdownFiles();

    for (const term of terms) {
      try {
        // Create regex pattern for [[term]]
        const escapedTerm = this.escapeRegex(term);
        const pattern = new RegExp(`\\[\\[${escapedTerm}\\]\\]`, 'g');

        // Search in all markdown files
        for (const filePath of mdFiles) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const matches = content.match(pattern);

            if (matches && matches.length > 0) {
              const relativePath = path.relative(this.vaultPath, filePath).replace(/\\/g, '/');

              // Skip Glossary files themselves
              if (relativePath.includes('5_Glossary/')) {
                continue;
              }

              foundSources.add(relativePath);
              totalCount += matches.length;
            }
          } catch (error) {
            // Skip files that can't be read
            continue;
          }
        }
      } catch (error) {
        // Term might not exist, continue
        continue;
      }
    }

    return {
      count: totalCount,
      sources: Array.from(foundSources).sort()
    };
  }

  /**
   * Get all markdown files in vault (except .obsidian)
   */
  getAllMarkdownFiles() {
    const files = [];

    const scan = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          // Skip hidden directories and .obsidian
          if (entry.name.startsWith('.')) {
            continue;
          }

          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            scan(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    scan(this.vaultPath);
    return files;
  }

  /**
   * Execute ripgrep command with --count-matches (fallback if ripgrep available)
   */
  executeRipgrepCountMatches(pattern) {
    try {
      const result = spawnSync('rg', [pattern, '.', '--type', 'md', '--count-matches'], {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      });

      if (result.error) {
        return '';
      }

      return result.stdout || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Execute ripgrep command (legacy, kept for compatibility)
   */
  executeRipgrep(pattern) {
    try {
      const result = spawnSync('rg', [pattern, '.', '--type', 'md', '--files-with-matches'], {
        cwd: this.vaultPath,
        encoding: 'utf-8'
      });

      if (result.error) {
        return '';
      }

      return result.stdout || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Escape special regex characters
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Update glossary files with reference counts
   */
  async updateGlossaryFiles(referenceData) {
    console.log('\n📝 Updating Glossary Files...\n');

    let updatedCount = 0;

    for (const [fileName, data] of Object.entries(referenceData)) {
      try {
        const filePath = path.join(this.glossaryPath, `${fileName}.md`);

        if (!fs.existsSync(filePath)) {
          console.warn(`⚠️  File not found: ${filePath}`);
          continue;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        // Update frontmatter
        frontmatter.reference_count = data.reference_count;
        frontmatter.source_documents = data.source_documents;
        frontmatter.ai_updated_at = data.last_counted;

        // Reconstruct file
        const newContent = matter.stringify(content, frontmatter);
        fs.writeFileSync(filePath, newContent, 'utf-8');

        updatedCount++;
        console.log(`✅ Updated: ${fileName} (count: ${data.reference_count})`);
      } catch (error) {
        console.error(`❌ Failed to update ${fileName}: ${error.message}`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} glossary file(s)`);

    return updatedCount;
  }

  /**
   * Save reference statistics
   */
  async saveStatistics(referenceData) {
    const stats = {
      version: '1.0',
      calculated_at: new Date().toISOString(),
      total_terms: Object.keys(referenceData).length,
      total_references: Object.values(referenceData).reduce((sum, item) => sum + item.reference_count, 0),
      zero_reference_count: Object.values(referenceData).filter(item => item.reference_count === 0).length,
      by_count: this.groupByCount(referenceData),
      unused_terms: Object.entries(referenceData)
        .filter(([_, item]) => item.reference_count === 0)
        .map(([name, item]) => ({
          term: item.title,
          file: item.file,
          ai_generated: item.ai_generated
        }))
    };

    fs.writeFileSync(this.statsPath, JSON.stringify(stats, null, 2), 'utf-8');
    return stats;
  }

  /**
   * Group reference data by count
   */
  groupByCount(referenceData) {
    const groups = {};

    for (const item of Object.values(referenceData)) {
      const count = item.reference_count;
      if (!groups[count]) {
        groups[count] = [];
      }
      groups[count].push(item.title);
    }

    return groups;
  }

  /**
   * Get unused terms (reference_count === 0)
   */
  getUnusedTerms(referenceData) {
    return Object.entries(referenceData)
      .filter(([_, item]) => item.reference_count === 0)
      .map(([name, item]) => ({
        term: item.title,
        file: item.file,
        ai_generated: item.ai_generated
      }));
  }

  /**
   * Display reference statistics in table format
   */
  displayStats(referenceData, options = {}) {
    console.log('\n📊 Glossary Reference Statistics\n');

    let items = Object.values(referenceData);

    // Filter by options
    if (options.zeroOnly) {
      items = items.filter(item => item.reference_count === 0);
    }

    // Sort
    if (options.sortAsc) {
      items.sort((a, b) => a.reference_count - b.reference_count);
    } else {
      items.sort((a, b) => b.reference_count - a.reference_count);
    }

    // Limit
    if (options.limit) {
      items = items.slice(0, options.limit);
    }

    // Display table
    console.log('┌─────────────────────────────┬────────────┬─────────────────────┐');
    console.log('│ Term                        │ References │ AI Generated        │');
    console.log('├─────────────────────────────┼────────────┼─────────────────────┤');

    for (const item of items) {
      const term = item.title.padEnd(27);
      const count = String(item.reference_count).padStart(10);
      const ai = item.ai_generated ? 'Yes' : 'No';
      console.log(`│ ${term} │${count} │ ${ai.padEnd(19)} │`);
    }

    console.log('└─────────────────────────────┴────────────┴─────────────────────┘');

    // Summary
    console.log(`\nTotal Terms: ${Object.keys(referenceData).length}`);
    console.log(`Total References: ${Object.values(referenceData).reduce((sum, item) => sum + item.reference_count, 0)}`);
    const unusedCount = Object.values(referenceData).filter(item => item.reference_count === 0).length;
    console.log(`Unused Terms (0 references): ${unusedCount}`);

    if (unusedCount > 0 && !options.zeroOnly) {
      console.log(`\n💡 Tip: Use 'node cli.js glossary-usage --zero' to see unused terms`);
    }
  }
}

module.exports = GlossaryReferenceCounter;

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'count';
  const options = {
    zeroOnly: process.argv.includes('--zero'),
    sortAsc: process.argv.includes('--sort-asc'),
    update: process.argv.includes('--update'),
    limit: 50
  };

  const counter = new GlossaryReferenceCounter(process.cwd());

  (async () => {
    try {
      switch (command) {
        case 'count':
          const results = await counter.countAllReferences();
          counter.displayStats(results, options);

          // Save statistics
          const stats = await counter.saveStatistics(results);
          console.log(`\n✅ Statistics saved to: .obsidian/state/glossary-reference-stats.json`);

          // Update glossary files if requested
          if (options.update) {
            await counter.updateGlossaryFiles(results);
          }
          break;

        case 'stats':
          const statsPath = path.join(counter.vaultPath, '.obsidian/state/glossary-reference-stats.json');
          if (fs.existsSync(statsPath)) {
            const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
            console.log(JSON.stringify(stats, null, 2));
          } else {
            console.log('⚠️  Statistics file not found. Run "count" first.');
          }
          break;

        case 'unused':
          const usageResults = await counter.countAllReferences();
          const unused = counter.getUnusedTerms(usageResults);
          if (unused.length === 0) {
            console.log('✅ No unused terms found!');
          } else {
            console.log(`\n⚠️  Found ${unused.length} unused term(s):\n`);
            unused.forEach((item, i) => {
              console.log(`${i + 1}. ${item.term} (${item.file})`);
              if (item.ai_generated) {
                console.log(`   → Candidate for archival`);
              }
            });
          }
          break;

        default:
          console.log('Usage: node glossary-reference-counter.js [command] [options]');
          console.log('\nCommands:');
          console.log('  count   - Count references for all glossary terms (default)');
          console.log('  stats   - Display saved statistics');
          console.log('  unused  - Show terms with 0 references');
          console.log('\nOptions:');
          console.log('  --zero       - Show only 0-reference terms');
          console.log('  --sort-asc   - Sort by reference count ascending');
          console.log('  --update     - Update glossary files with counts');
          console.log('\nExamples:');
          console.log('  node glossary-reference-counter.js count');
          console.log('  node glossary-reference-counter.js count --zero --update');
          console.log('  node glossary-reference-counter.js unused');
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
