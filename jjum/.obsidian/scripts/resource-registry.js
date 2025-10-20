const fs = require('fs');
const path = require('path');

class ResourceRegistry {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.registryPath = path.join(this.vaultPath, '.obsidian/state/resource-registry.json');
  }

  /**
   * Load resource registry from file
   */
  async load() {
    try {
      const data = fs.readFileSync(this.registryPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load resource registry:', error.message);
      return this.getDefaultRegistry();
    }
  }

  /**
   * Load registry synchronously
   */
  loadSync() {
    try {
      const data = fs.readFileSync(this.registryPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load resource registry:', error.message);
      return this.getDefaultRegistry();
    }
  }

  /**
   * Get default registry structure
   */
  getDefaultRegistry() {
    return {
      version: '1.0',
      last_updated: null,
      glossary: {
        path: '5_Glossary',
        index_file: '.obsidian/state/glossary-index.json',
        last_indexed: null,
        total_items: 0,
        cache_valid: false
      },
      tags: {
        allowed_tags_file: '.obsidian/config/tag-system.json',
        last_updated: null
      },
      folders: {
        inbox: '00_Inbox',
        git_imports: '00_Inbox/git-imports',
        projects: '1_Projects',
        areas: '2_Areas',
        resources: '3_Resources',
        archives: '4_Archives',
        glossary: '5_Glossary'
      },
      filing_rules: {
        rules_file: '.obsidian/config/filing-rules.json',
        last_updated: null
      },
      templates: {
        path: '.obsidian/templates',
        available: []
      }
    };
  }

  /**
   * Save resource registry to file
   */
  async save(registry) {
    try {
      registry.last_updated = new Date().toISOString();
      fs.writeFileSync(this.registryPath, JSON.stringify(registry, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save resource registry:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific resource by path
   */
  async get(resourcePath) {
    const registry = await this.load();
    const parts = resourcePath.split('.');

    let current = registry;
    for (const part of parts) {
      if (current[part] === undefined) {
        return null;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Update a resource
   */
  async update(resourcePath, value) {
    const registry = await this.load();
    const parts = resourcePath.split('.');
    const lastPart = parts.pop();

    let current = registry;
    for (const part of parts) {
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }

    current[lastPart] = value;
    await this.save(registry);

    console.log(`✅ Updated resource: ${resourcePath}`);
  }

  /**
   * Get folder path by name
   */
  async getFolder(folderName) {
    const registry = await this.load();
    const folderPath = registry.folders[folderName];

    if (!folderPath) {
      throw new Error(`Folder '${folderName}' not found in registry`);
    }

    return path.join(this.vaultPath, folderPath);
  }

  /**
   * Get glossary configuration
   */
  async getGlossaryConfig() {
    const registry = await this.load();
    return registry.glossary;
  }

  /**
   * Update glossary index metadata
   */
  async updateGlossaryIndex(totalItems) {
    const registry = await this.load();
    registry.glossary.last_indexed = new Date().toISOString();
    registry.glossary.total_items = totalItems;
    registry.glossary.cache_valid = true;
    await this.save(registry);
  }

  /**
   * Invalidate glossary cache
   */
  async invalidateGlossaryCache() {
    const registry = await this.load();
    registry.glossary.cache_valid = false;
    await this.save(registry);
  }

  /**
   * Get filing rules file path
   */
  async getFilingRulesPath() {
    const registry = await this.load();
    return path.join(this.vaultPath, registry.filing_rules.rules_file);
  }

  /**
   * Get tag system file path
   */
  async getTagSystemPath() {
    const registry = await this.load();
    return path.join(this.vaultPath, registry.tags.allowed_tags_file);
  }

  /**
   * Validate resource paths
   */
  async validate() {
    const registry = await this.load();
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check folder paths
    for (const [name, folderPath] of Object.entries(registry.folders)) {
      const fullPath = path.join(this.vaultPath, folderPath);
      if (!fs.existsSync(fullPath)) {
        results.warnings.push(`Folder '${name}' does not exist: ${folderPath}`);
      }
    }

    // Check glossary index
    const glossaryIndexPath = path.join(this.vaultPath, registry.glossary.index_file);
    if (!fs.existsSync(glossaryIndexPath)) {
      results.warnings.push(`Glossary index does not exist: ${registry.glossary.index_file}`);
    }

    // Check filing rules
    const filingRulesPath = path.join(this.vaultPath, registry.filing_rules.rules_file);
    if (!fs.existsSync(filingRulesPath)) {
      results.warnings.push(`Filing rules file does not exist: ${registry.filing_rules.rules_file}`);
    }

    // Check tag system
    const tagSystemPath = path.join(this.vaultPath, registry.tags.allowed_tags_file);
    if (!fs.existsSync(tagSystemPath)) {
      results.warnings.push(`Tag system file does not exist: ${registry.tags.allowed_tags_file}`);
    }

    if (results.warnings.length > 0) {
      console.log('⚠️  Registry validation warnings:', results.warnings);
    } else {
      console.log('✅ Registry validation passed');
    }

    return results;
  }

  /**
   * Initialize missing resources
   */
  async initialize() {
    const registry = await this.load();

    // Create missing folders
    for (const [name, folderPath] of Object.entries(registry.folders)) {
      const fullPath = path.join(this.vaultPath, folderPath);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created folder: ${folderPath}`);
      }
    }

    // Create glossary index if missing
    const glossaryIndexPath = path.join(this.vaultPath, registry.glossary.index_file);
    if (!fs.existsSync(glossaryIndexPath)) {
      const defaultIndex = {
        version: '1.0',
        built_at: new Date().toISOString(),
        items: [],
        title_map: {},
        alias_map: {}
      };
      fs.writeFileSync(glossaryIndexPath, JSON.stringify(defaultIndex, null, 2), 'utf-8');
      console.log(`📝 Created glossary index: ${registry.glossary.index_file}`);
    }

    console.log('✅ Resource registry initialized');
  }

  /**
   * Add a new folder to registry
   */
  async addFolder(name, relativePath) {
    const registry = await this.load();
    registry.folders[name] = relativePath;
    await this.save(registry);

    // Create the folder if it doesn't exist
    const fullPath = path.join(this.vaultPath, relativePath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    console.log(`✅ Added folder to registry: ${name} -> ${relativePath}`);
  }

  /**
   * Get all folder paths
   */
  async getAllFolders() {
    const registry = await this.load();
    return registry.folders;
  }
}

module.exports = ResourceRegistry;
