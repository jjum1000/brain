const fs = require('fs');
const path = require('path');

class FilingRulesEngine {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.rulesPath = path.join(this.vaultPath, '.obsidian/config/filing-rules.json');
  }

  /**
   * Load filing rules from file
   */
  async loadRules() {
    try {
      const data = fs.readFileSync(this.rulesPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load filing rules:', error.message);
      return this.getDefaultRules();
    }
  }

  /**
   * Get default filing rules
   */
  getDefaultRules() {
    return {
      version: '1.0',
      last_updated: null,
      rules: [
        {
          id: 'rule-default',
          name: 'Default - General Resources',
          priority: 999,
          conditions: {},
          destination: '3_Resources/General',
          enabled: true
        }
      ]
    };
  }

  /**
   * Save filing rules to file
   */
  async saveRules(rulesData) {
    rulesData.last_updated = new Date().toISOString();
    fs.writeFileSync(this.rulesPath, JSON.stringify(rulesData, null, 2), 'utf-8');
  }

  /**
   * Determine destination folder for a document
   */
  async determineDestination(documentState, metadata = {}) {
    const rulesData = await this.loadRules();

    // Sort rules by priority (lower number = higher priority)
    const sortedRules = rulesData.rules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    // Try each rule
    for (const rule of sortedRules) {
      if (this.matchesConditions(rule.conditions, documentState, metadata)) {
        console.log(`   📋 Matched filing rule: ${rule.name}`);
        return {
          destination: rule.destination,
          rule_id: rule.id,
          rule_name: rule.name
        };
      }
    }

    // If no rule matched, use default (last resort)
    const defaultRule = sortedRules[sortedRules.length - 1];
    return {
      destination: defaultRule.destination,
      rule_id: defaultRule.id,
      rule_name: 'Default'
    };
  }

  /**
   * Check if document matches rule conditions
   */
  matchesConditions(conditions, documentState, metadata) {
    // Empty conditions match everything (default rule)
    if (Object.keys(conditions).length === 0) {
      return true;
    }

    const checks = [];

    // Check source
    if (conditions.source) {
      const source = metadata.source || documentState.frontmatter?.source || 'unknown';
      checks.push(source === conditions.source);
    }

    // Check tags
    if (conditions.tags && Array.isArray(conditions.tags)) {
      const docTags = documentState.tags || documentState.frontmatter?.tags || [];
      const tagArray = Array.isArray(docTags) ? docTags : [docTags];

      if (conditions.any) {
        // Match if ANY tag matches
        checks.push(conditions.tags.some(tag =>
          tagArray.some(docTag => docTag.toLowerCase() === tag.toLowerCase())
        ));
      } else {
        // Match if ALL tags match
        checks.push(conditions.tags.every(tag =>
          tagArray.some(docTag => docTag.toLowerCase() === tag.toLowerCase())
        ));
      }
    }

    // Check keywords
    if (conditions.keywords && Array.isArray(conditions.keywords)) {
      const docKeywords = documentState.keywords || documentState.frontmatter?.keywords || [];
      const keywordTexts = docKeywords.map(k =>
        typeof k === 'string' ? k : k.text
      ).map(k => k.toLowerCase());

      if (conditions.any) {
        checks.push(conditions.keywords.some(kw =>
          keywordTexts.includes(kw.toLowerCase())
        ));
      } else {
        checks.push(conditions.keywords.every(kw =>
          keywordTexts.includes(kw.toLowerCase())
        ));
      }
    }

    // Check path pattern
    if (conditions.path_pattern) {
      const filePath = documentState.path || '';
      checks.push(filePath.includes(conditions.path_pattern));
    }

    // Check frontmatter fields
    if (conditions.frontmatter) {
      for (const [key, value] of Object.entries(conditions.frontmatter)) {
        const docValue = documentState.frontmatter?.[key];
        checks.push(docValue === value);
      }
    }

    // All checks must pass (AND logic)
    return checks.length > 0 && checks.every(check => check === true);
  }

  /**
   * Generate file path for destination
   */
  async generateFilePath(documentState, destinationFolder) {
    // Get filename from current path
    const currentFileName = path.basename(documentState.path);

    // Get title from frontmatter if available
    const title = documentState.frontmatter?.title;

    // Use title for filename if available, otherwise use current filename
    let fileName;
    if (title) {
      // Sanitize title for filename
      fileName = this.sanitizeFileName(title) + '.md';
    } else {
      fileName = currentFileName;
    }

    // Construct full path
    const destinationPath = path.join(destinationFolder, fileName);

    return destinationPath;
  }

  /**
   * Sanitize string for use as filename
   */
  sanitizeFileName(str) {
    return str
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .toLowerCase()
      .substring(0, 100); // Limit length
  }

  /**
   * Add new filing rule
   */
  async addRule(rule) {
    const rulesData = await this.loadRules();

    // Generate ID if not provided
    if (!rule.id) {
      rule.id = `rule-${Date.now()}`;
    }

    // Set default priority if not provided
    if (!rule.priority) {
      rule.priority = rulesData.rules.length + 1;
    }

    // Set default enabled state
    if (rule.enabled === undefined) {
      rule.enabled = true;
    }

    rulesData.rules.push(rule);
    await this.saveRules(rulesData);

    console.log(`✅ Added filing rule: ${rule.name} (${rule.id})`);
    return rule;
  }

  /**
   * Update existing rule
   */
  async updateRule(ruleId, updates) {
    const rulesData = await this.loadRules();
    const index = rulesData.rules.findIndex(r => r.id === ruleId);

    if (index === -1) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    rulesData.rules[index] = {
      ...rulesData.rules[index],
      ...updates
    };

    await this.saveRules(rulesData);

    console.log(`✅ Updated filing rule: ${ruleId}`);
    return rulesData.rules[index];
  }

  /**
   * Delete rule
   */
  async deleteRule(ruleId) {
    const rulesData = await this.loadRules();
    const index = rulesData.rules.findIndex(r => r.id === ruleId);

    if (index === -1) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const deletedRule = rulesData.rules.splice(index, 1)[0];
    await this.saveRules(rulesData);

    console.log(`✅ Deleted filing rule: ${deletedRule.name}`);
    return deletedRule;
  }

  /**
   * Enable/disable rule
   */
  async toggleRule(ruleId, enabled) {
    const rulesData = await this.loadRules();
    const rule = rulesData.rules.find(r => r.id === ruleId);

    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    rule.enabled = enabled;
    await this.saveRules(rulesData);

    console.log(`✅ ${enabled ? 'Enabled' : 'Disabled'} rule: ${rule.name}`);
    return rule;
  }

  /**
   * Get all rules
   */
  async getAllRules() {
    const rulesData = await this.loadRules();
    return rulesData.rules;
  }

  /**
   * Get rule by ID
   */
  async getRule(ruleId) {
    const rulesData = await this.loadRules();
    return rulesData.rules.find(r => r.id === ruleId);
  }

  /**
   * Test rule against document
   */
  async testRule(ruleId, documentState, metadata = {}) {
    const rule = await this.getRule(ruleId);

    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const matches = this.matchesConditions(rule.conditions, documentState, metadata);

    return {
      rule_id: rule.id,
      rule_name: rule.name,
      matches: matches,
      destination: matches ? rule.destination : null
    };
  }

  /**
   * Get filing statistics
   */
  async getStats() {
    const rulesData = await this.loadRules();

    return {
      total_rules: rulesData.rules.length,
      enabled_rules: rulesData.rules.filter(r => r.enabled).length,
      disabled_rules: rulesData.rules.filter(r => !r.enabled).length,
      rules_by_priority: rulesData.rules
        .sort((a, b) => a.priority - b.priority)
        .map(r => ({
          id: r.id,
          name: r.name,
          priority: r.priority,
          enabled: r.enabled
        }))
    };
  }
}

module.exports = FilingRulesEngine;

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'list';
  const vaultPath = process.cwd();

  const engine = new FilingRulesEngine(vaultPath);

  (async () => {
    try {
      switch (command) {
        case 'list':
          const rules = await engine.getAllRules();
          console.log('📋 Filing Rules:\n');
          rules.forEach(rule => {
            const status = rule.enabled ? '✅' : '❌';
            console.log(`${status} [${rule.priority}] ${rule.name} (${rule.id})`);
            console.log(`   → ${rule.destination}`);
            console.log(`   Conditions:`, JSON.stringify(rule.conditions));
            console.log('');
          });
          break;

        case 'stats':
          const stats = await engine.getStats();
          console.log('📊 Filing Rules Statistics:\n');
          console.log(JSON.stringify(stats, null, 2));
          break;

        default:
          console.log('Usage: node filing-rules-engine.js [command]');
          console.log('Commands:');
          console.log('  list  - List all filing rules (default)');
          console.log('  stats - Show filing rules statistics');
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
