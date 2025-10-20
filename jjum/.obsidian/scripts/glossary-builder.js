const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class GlossaryBuilder {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.indexPath = path.join(this.vaultPath, '.obsidian/state/glossary-index.json');
  }

  /**
   * Build glossary index from files
   */
  async build(glossaryPath = '5_Glossary') {
    console.log('🔨 Building Glossary Index...\n');

    const fullGlossaryPath = path.join(this.vaultPath, glossaryPath);

    if (!fs.existsSync(fullGlossaryPath)) {
      console.log(`⚠️  Glossary directory does not exist: ${glossaryPath}`);
      console.log(`Creating directory: ${fullGlossaryPath}`);
      fs.mkdirSync(fullGlossaryPath, { recursive: true });
    }

    const items = [];
    const titleMap = {};
    const aliasMap = {};

    // Scan all .md files in glossary directory
    const files = this.scanDirectory(fullGlossaryPath);

    console.log(`Found ${files.length} glossary file(s)\n`);

    for (const filePath of files) {
      try {
        const item = await this.processGlossaryFile(filePath, glossaryPath);

        if (item) {
          items.push(item);

          // Build title map
          const normalizedTitle = item.title.toLowerCase();
          titleMap[normalizedTitle] = item.file;

          // Build alias map
          if (item.aliases && item.aliases.length > 0) {
            item.aliases.forEach(alias => {
              const normalizedAlias = alias.toLowerCase();
              aliasMap[normalizedAlias] = item.file;
            });
          }

          // Build synonym map (Phase 4)
          if (item.synonyms && item.synonyms.length > 0) {
            item.synonyms.forEach(synonym => {
              const normalizedSynonym = synonym.toLowerCase();
              aliasMap[normalizedSynonym] = item.file; // Synonyms work like aliases
            });
          }

          console.log(`   ✅ Indexed: ${item.title} (priority: ${item.priority})`);
          if (item.aliases.length > 0) {
            console.log(`      Aliases: ${item.aliases.join(', ')}`);
          }
          if (item.synonyms && item.synonyms.length > 0) {
            console.log(`      Synonyms: ${item.synonyms.join(', ')}`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Error processing ${filePath}: ${error.message}`);
      }
    }

    // Build index
    const index = {
      version: '1.0',
      built_at: new Date().toISOString(),
      items: items,
      title_map: titleMap,
      alias_map: aliasMap
    };

    // Save index
    await this.saveIndex(index);

    console.log(`\n✅ Glossary Index Built Successfully`);
    console.log(`   Total items: ${items.length}`);
    console.log(`   Total aliases: ${Object.keys(aliasMap).length}`);

    // Update Resource Registry
    await this.updateRegistry(items.length);

    return index;
  }

  /**
   * Scan directory for .md files
   */
  scanDirectory(dirPath) {
    const files = [];

    const scan = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    };

    scan(dirPath);
    return files;
  }

  /**
   * Process individual glossary file
   */
  async processGlossaryFile(filePath, glossaryPath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    // Get relative path from vault root
    const relativePath = path.relative(this.vaultPath, filePath);

    // Extract title from frontmatter or filename
    const title = frontmatter.title ||
                  frontmatter.name ||
                  path.basename(filePath, '.md');

    // Extract aliases
    let aliases = [];
    if (frontmatter.aliases) {
      aliases = Array.isArray(frontmatter.aliases)
        ? frontmatter.aliases
        : [frontmatter.aliases];
    } else if (frontmatter.alias) {
      aliases = Array.isArray(frontmatter.alias)
        ? frontmatter.alias
        : [frontmatter.alias];
    }

    // Add title as an alias variant
    aliases.push(title);
    aliases.push(title.toLowerCase());

    // Remove duplicates
    aliases = [...new Set(aliases)];

    // Extract tags
    let tags = [];
    if (frontmatter.tags) {
      tags = Array.isArray(frontmatter.tags)
        ? frontmatter.tags
        : [frontmatter.tags];
    }

    // Extract related concepts from frontmatter or body links
    const relatedConcepts = this.extractRelatedConcepts(frontmatter, body);

    // Extract synonyms (new in Phase 4)
    const synonyms = this.extractSynonyms(frontmatter);

    // Calculate priority score (new in Phase 4)
    const priority = this.calculatePriority(frontmatter, body, relatedConcepts);

    // Generate ID from title
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      id: id,
      file: relativePath.replace(/\\/g, '/'), // Normalize path separators
      title: title,
      aliases: aliases,
      synonyms: synonyms,
      tags: tags,
      related_concepts: relatedConcepts,
      priority: priority,
      created: frontmatter.created || null,
      modified: frontmatter.modified || null
    };
  }

  /**
   * Extract synonyms from frontmatter (Phase 4)
   */
  extractSynonyms(frontmatter) {
    const synonyms = [];

    // Check various frontmatter fields
    if (frontmatter.synonyms) {
      const syns = Array.isArray(frontmatter.synonyms)
        ? frontmatter.synonyms
        : [frontmatter.synonyms];
      synonyms.push(...syns);
    }

    if (frontmatter.synonym) {
      const syns = Array.isArray(frontmatter.synonym)
        ? frontmatter.synonym
        : [frontmatter.synonym];
      synonyms.push(...syns);
    }

    if (frontmatter.aka) { // Also Known As
      const akas = Array.isArray(frontmatter.aka)
        ? frontmatter.aka
        : [frontmatter.aka];
      synonyms.push(...akas);
    }

    // Remove duplicates and empty strings
    return [...new Set(synonyms.filter(s => s && s.trim()))];
  }

  /**
   * Calculate priority score for a glossary term (Phase 4)
   * Higher score = more important term
   * Score factors:
   * - Number of related concepts (connections)
   * - Number of tags (categorization depth)
   * - Explicit priority in frontmatter
   * - Length of content (more comprehensive)
   * - Number of references (if tracked)
   */
  calculatePriority(frontmatter, body, relatedConcepts) {
    let score = 0;

    // Explicit priority (if set in frontmatter)
    if (frontmatter.priority !== undefined) {
      score += parseInt(frontmatter.priority) * 10;
    }

    // Related concepts bonus (connectivity)
    score += relatedConcepts.length * 2;

    // Tags bonus (categorization)
    if (frontmatter.tags) {
      const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
      score += tags.length;
    }

    // Content length bonus (comprehensiveness)
    const wordCount = body.split(/\s+/).length;
    if (wordCount > 500) score += 5;
    else if (wordCount > 200) score += 3;
    else if (wordCount > 50) score += 1;

    // References bonus (if tracked in frontmatter)
    if (frontmatter.references) {
      const refs = Array.isArray(frontmatter.references) ? frontmatter.references : [frontmatter.references];
      score += refs.length;
    }

    // Importance marker (if flagged as important)
    if (frontmatter.important === true || frontmatter.core === true) {
      score += 10;
    }

    return score;
  }

  /**
   * Extract related concepts from frontmatter and body
   */
  extractRelatedConcepts(frontmatter, body) {
    const concepts = new Set();

    // From frontmatter
    if (frontmatter.related) {
      const related = Array.isArray(frontmatter.related)
        ? frontmatter.related
        : [frontmatter.related];
      related.forEach(c => concepts.add(c));
    }

    if (frontmatter.related_concepts) {
      const relatedConcepts = Array.isArray(frontmatter.related_concepts)
        ? frontmatter.related_concepts
        : [frontmatter.related_concepts];
      relatedConcepts.forEach(c => concepts.add(c));
    }

    // From body - extract wiki links [[...]]
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(body)) !== null) {
      const linkText = match[1].split('|')[0].trim(); // Handle [[link|display]] format
      concepts.add(linkText);
    }

    return Array.from(concepts).slice(0, 10); // Limit to 10 concepts
  }

  /**
   * Save index to file
   */
  async saveIndex(index) {
    fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * Load index from file
   */
  async loadIndex() {
    try {
      const data = fs.readFileSync(this.indexPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {
        version: '1.0',
        built_at: null,
        items: [],
        title_map: {},
        alias_map: {}
      };
    }
  }

  /**
   * Update Resource Registry with new index info
   */
  async updateRegistry(totalItems) {
    try {
      const ResourceRegistry = require('./resource-registry');
      const registry = new ResourceRegistry(this.vaultPath);
      await registry.updateGlossaryIndex(totalItems);
      console.log('   Updated Resource Registry');
    } catch (error) {
      console.error('   Failed to update Resource Registry:', error.message);
    }
  }

  /**
   * Find glossary entry by keyword
   */
  async find(keyword) {
    const index = await this.loadIndex();
    const normalized = keyword.toLowerCase();

    // Try title map first
    if (index.title_map[normalized]) {
      return index.items.find(item => item.file === index.title_map[normalized]);
    }

    // Try alias map
    if (index.alias_map[normalized]) {
      return index.items.find(item => item.file === index.alias_map[normalized]);
    }

    return null;
  }

  /**
   * Search glossary entries (Enhanced in Phase 4)
   */
  async search(query, options = {}) {
    const index = await this.loadIndex();
    const normalized = query.toLowerCase();

    let results = index.items.filter(item =>
      item.title.toLowerCase().includes(normalized) ||
      item.aliases.some(alias => alias.toLowerCase().includes(normalized)) ||
      (item.synonyms && item.synonyms.some(syn => syn.toLowerCase().includes(normalized))) ||
      item.tags.some(tag => tag.toLowerCase().includes(normalized))
    );

    // Sort by priority if requested (Phase 4)
    if (options.sortByPriority) {
      results.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    // Limit results if requested
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Advanced search with fuzzy matching and priority ranking (Phase 4)
   */
  async advancedSearch(query, options = {}) {
    const index = await this.loadIndex();
    const normalized = query.toLowerCase();
    const results = [];

    // Calculate relevance score for each item
    for (const item of index.items) {
      let relevance = 0;

      // Exact title match (highest score)
      if (item.title.toLowerCase() === normalized) {
        relevance += 100;
      } else if (item.title.toLowerCase().includes(normalized)) {
        relevance += 50;
      }

      // Alias matches
      if (item.aliases) {
        for (const alias of item.aliases) {
          if (alias.toLowerCase() === normalized) {
            relevance += 80;
          } else if (alias.toLowerCase().includes(normalized)) {
            relevance += 30;
          }
        }
      }

      // Synonym matches (Phase 4)
      if (item.synonyms) {
        for (const synonym of item.synonyms) {
          if (synonym.toLowerCase() === normalized) {
            relevance += 70;
          } else if (synonym.toLowerCase().includes(normalized)) {
            relevance += 25;
          }
        }
      }

      // Tag matches
      if (item.tags && item.tags.length > 0) {
        for (const tag of item.tags) {
          if (tag.toLowerCase() === normalized) {
            relevance += 20;
          } else if (tag.toLowerCase().includes(normalized)) {
            relevance += 10;
          }
        }
      }

      // Related concepts matches
      if (item.related_concepts && item.related_concepts.length > 0) {
        for (const concept of item.related_concepts) {
          if (concept.toLowerCase().includes(normalized)) {
            relevance += 5;
          }
        }
      }

      // Boost by priority (Phase 4)
      if (item.priority) {
        relevance += item.priority * 0.5;
      }

      // Add to results if relevance > 0
      if (relevance > 0) {
        results.push({
          ...item,
          relevance: Math.round(relevance)
        });
      }
    }

    // Sort by relevance (descending)
    results.sort((a, b) => b.relevance - a.relevance);

    // Apply limit
    const limit = options.limit || 10;
    return results.slice(0, limit);
  }

  /**
   * Find related terms based on a glossary entry (Phase 4)
   */
  async findRelated(termId, options = {}) {
    const index = await this.loadIndex();
    const term = index.items.find(item => item.id === termId);

    if (!term) {
      return [];
    }

    const related = [];
    const relatedIds = new Set();

    // Add explicitly related concepts
    if (term.related_concepts) {
      for (const conceptName of term.related_concepts) {
        const found = await this.find(conceptName);
        if (found && !relatedIds.has(found.id)) {
          related.push({ ...found, relationship: 'explicit' });
          relatedIds.add(found.id);
        }
      }
    }

    // Find terms with shared tags
    if (term.tags && term.tags.length > 0) {
      for (const item of index.items) {
        if (item.id === termId || relatedIds.has(item.id)) continue;

        const sharedTags = item.tags.filter(tag => term.tags.includes(tag));
        if (sharedTags.length > 0) {
          related.push({
            ...item,
            relationship: 'shared-tags',
            shared_tags: sharedTags,
            similarity: sharedTags.length / Math.max(term.tags.length, item.tags.length)
          });
          relatedIds.add(item.id);
        }
      }
    }

    // Sort by priority and similarity
    related.sort((a, b) => {
      if (a.relationship === 'explicit' && b.relationship !== 'explicit') return -1;
      if (b.relationship === 'explicit' && a.relationship !== 'explicit') return 1;
      return (b.priority || 0) - (a.priority || 0);
    });

    // Apply limit
    const limit = options.limit || 10;
    return related.slice(0, limit);
  }

  /**
   * Get statistics
   */
  async getStats() {
    const index = await this.loadIndex();

    return {
      total_items: index.items.length,
      total_aliases: Object.keys(index.alias_map).length,
      built_at: index.built_at,
      by_tag: index.items.reduce((acc, item) => {
        item.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {})
    };
  }
}

module.exports = GlossaryBuilder;

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'build';

  // For commands that take arguments, don't use argv[3] as vaultPath
  const commandsWithArgs = ['find', 'search', 'advanced-search', 'related'];
  const vaultPath = commandsWithArgs.includes(command) ? process.cwd() : (process.argv[3] || process.cwd());

  const builder = new GlossaryBuilder(vaultPath);

  (async () => {
    try {
      switch (command) {
        case 'build':
          await builder.build();
          break;

        case 'stats':
          const stats = await builder.getStats();
          console.log('📊 Glossary Statistics:\n');
          console.log(JSON.stringify(stats, null, 2));
          break;

        case 'find':
          const keyword = process.argv[3];
          if (!keyword) {
            console.log('Usage: node glossary-builder.js find <keyword>');
            break;
          }
          const result = await builder.find(keyword);
          console.log(result ? JSON.stringify(result, null, 2) : 'Not found');
          break;

        case 'search':
          const query = process.argv[3];
          if (!query) {
            console.log('Usage: node glossary-builder.js search <query>');
            break;
          }
          const results = await builder.search(query, { sortByPriority: true });
          console.log(`Found ${results.length} result(s):\n`);
          results.forEach(r => console.log(`- ${r.title} (priority: ${r.priority || 0}) - ${r.file}`));
          break;

        case 'advanced-search':
          const advQuery = process.argv[3];
          if (!advQuery) {
            console.log('Usage: node glossary-builder.js advanced-search <query>');
            break;
          }
          const advResults = await builder.advancedSearch(advQuery);
          console.log(`\n🔍 Advanced Search Results for "${advQuery}":\n`);
          advResults.forEach((r, i) => {
            console.log(`${i + 1}. ${r.title} (relevance: ${r.relevance}, priority: ${r.priority || 0})`);
            console.log(`   File: ${r.file}`);
            if (r.synonyms && r.synonyms.length > 0) {
              console.log(`   Synonyms: ${r.synonyms.join(', ')}`);
            }
            console.log();
          });
          break;

        case 'related':
          const termId = process.argv[3];
          if (!termId) {
            console.log('Usage: node glossary-builder.js related <term-id>');
            break;
          }
          const relatedResults = await builder.findRelated(termId);
          console.log(`\n🔗 Related Terms for "${termId}":\n`);
          relatedResults.forEach((r, i) => {
            console.log(`${i + 1}. ${r.title} (${r.relationship})`);
            if (r.shared_tags) {
              console.log(`   Shared tags: ${r.shared_tags.join(', ')}`);
            }
            console.log(`   Priority: ${r.priority || 0}`);
            console.log();
          });
          break;

        default:
          console.log('Usage: node glossary-builder.js [command] [vault-path]');
          console.log('\nCommands:');
          console.log('  build            - Build glossary index (default)');
          console.log('  stats            - Show glossary statistics');
          console.log('  find <keyword>   - Find exact glossary entry');
          console.log('  search <query>   - Search glossary entries (with priority sort)');
          console.log('  advanced-search <query> - Advanced search with relevance scoring (Phase 4)');
          console.log('  related <term-id>       - Find related terms (Phase 4)');
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
