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

          console.log(`   ✅ Indexed: ${item.title}`);
          if (item.aliases.length > 0) {
            console.log(`      Aliases: ${item.aliases.join(', ')}`);
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

    // Generate ID from title
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      id: id,
      file: relativePath.replace(/\\/g, '/'), // Normalize path separators
      title: title,
      aliases: aliases,
      tags: tags,
      related_concepts: relatedConcepts,
      created: frontmatter.created || null,
      modified: frontmatter.modified || null
    };
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
   * Search glossary entries
   */
  async search(query) {
    const index = await this.loadIndex();
    const normalized = query.toLowerCase();

    return index.items.filter(item =>
      item.title.toLowerCase().includes(normalized) ||
      item.aliases.some(alias => alias.toLowerCase().includes(normalized)) ||
      item.tags.some(tag => tag.toLowerCase().includes(normalized))
    );
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
  const vaultPath = process.argv[3] || process.cwd();

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
          const results = await builder.search(query);
          console.log(`Found ${results.length} result(s):\n`);
          results.forEach(r => console.log(`- ${r.title} (${r.file})`));
          break;

        default:
          console.log('Usage: node glossary-builder.js [command] [vault-path]');
          console.log('Commands:');
          console.log('  build   - Build glossary index (default)');
          console.log('  stats   - Show glossary statistics');
          console.log('  find    - Find glossary entry by keyword');
          console.log('  search  - Search glossary entries');
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
