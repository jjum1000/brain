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
   * Determine destination folder for a document (Enhanced in Phase 4)
   */
  async determineDestination(documentState, metadata = {}) {
    const rulesData = await this.loadRules();

    // Sort rules by priority (lower number = higher priority)
    const enabledRules = rulesData.rules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    // Phase 4: Collect all matching rules with scores for conflict resolution
    const matches = [];

    for (const rule of enabledRules) {
      const matchResult = this.matchesConditions(rule.conditions, documentState, metadata);
      if (matchResult.matches) {
        matches.push({
          rule: rule,
          score: matchResult.score,
          matched_conditions: matchResult.matched_conditions
        });
      }
    }

    // If no matches, use default rule
    if (matches.length === 0) {
      const defaultRule = enabledRules.find(r => r.id === 'rule-default') || enabledRules[enabledRules.length - 1];
      return {
        destination: defaultRule.destination,
        rule_id: defaultRule.id,
        rule_name: 'Default',
        confidence: 'default'
      };
    }

    // Phase 4: Resolve conflicts using scoring system
    const bestMatch = this.resolveConflicts(matches);

    console.log(`   📋 Matched filing rule: ${bestMatch.rule.name} (score: ${bestMatch.score})`);
    if (matches.length > 1) {
      console.log(`   ⚠️  ${matches.length} rules matched, selected best match by score`);
    }

    return {
      destination: bestMatch.rule.destination,
      rule_id: bestMatch.rule.id,
      rule_name: bestMatch.rule.name,
      confidence: bestMatch.score >= 100 ? 'high' : bestMatch.score >= 50 ? 'medium' : 'low',
      score: bestMatch.score,
      alternatives: matches.length > 1 ? matches.slice(1, 3).map(m => ({
        rule_name: m.rule.name,
        destination: m.rule.destination,
        score: m.score
      })) : []
    };
  }

  /**
   * Resolve conflicts when multiple rules match (Phase 4)
   */
  resolveConflicts(matches) {
    // Sort by score (descending), then by priority (ascending)
    matches.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score wins
      }
      return a.rule.priority - b.rule.priority; // Lower priority number wins
    });

    return matches[0];
  }

  /**
   * Check if document matches rule conditions (Enhanced in Phase 4 with scoring)
   */
  matchesConditions(conditions, documentState, metadata) {
    // Empty conditions match everything (default rule)
    if (Object.keys(conditions).length === 0) {
      return { matches: true, score: 0, matched_conditions: [] };
    }

    let score = 0;
    const matched_conditions = [];
    let failed = false;

    // Check source (50 points)
    if (conditions.source) {
      const source = metadata.source || documentState.frontmatter?.source || 'unknown';
      if (source === conditions.source) {
        score += 50;
        matched_conditions.push('source');
      } else {
        failed = true; // Source must match if specified
      }
    }

    // Check tags (30 points per tag)
    if (conditions.tags && Array.isArray(conditions.tags)) {
      const docTags = documentState.tags || documentState.frontmatter?.tags || [];
      const tagArray = Array.isArray(docTags) ? docTags : [docTags];

      const matchedTags = conditions.tags.filter(tag =>
        tagArray.some(docTag => docTag.toLowerCase() === tag.toLowerCase())
      );

      if (conditions.any && matchedTags.length > 0) {
        score += matchedTags.length * 30;
        matched_conditions.push(`tags(${matchedTags.length})`);
      } else if (!conditions.any && matchedTags.length === conditions.tags.length) {
        score += matchedTags.length * 30;
        matched_conditions.push(`tags(all-${matchedTags.length})`);
      } else if (!conditions.any) {
        failed = true; // All tags must match if not using 'any' mode
      }
    }

    // Check keywords (20 points per keyword)
    if (conditions.keywords && Array.isArray(conditions.keywords)) {
      const docKeywords = documentState.keywords || documentState.frontmatter?.keywords || [];
      const keywordTexts = docKeywords.map(k =>
        typeof k === 'string' ? k : k.text
      ).map(k => k.toLowerCase());

      const matchedKeywords = conditions.keywords.filter(kw =>
        keywordTexts.includes(kw.toLowerCase())
      );

      if (conditions.any && matchedKeywords.length > 0) {
        score += matchedKeywords.length * 20;
        matched_conditions.push(`keywords(${matchedKeywords.length})`);
      } else if (!conditions.any && matchedKeywords.length === conditions.keywords.length) {
        score += matchedKeywords.length * 20;
        matched_conditions.push(`keywords(all-${matchedKeywords.length})`);
      } else if (!conditions.any) {
        failed = true;
      }
    }

    // Check content patterns (Phase 4 - 15 points per pattern)
    if (conditions.content_patterns && Array.isArray(conditions.content_patterns)) {
      const body = documentState.body || '';
      const matchedPatterns = conditions.content_patterns.filter(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(body);
      });

      if (matchedPatterns.length > 0) {
        score += matchedPatterns.length * 15;
        matched_conditions.push(`content(${matchedPatterns.length})`);
      } else if (!conditions.any) {
        failed = true;
      }
    }

    // Check content keywords (Phase 4 - 10 points per keyword)
    if (conditions.content_keywords && Array.isArray(conditions.content_keywords)) {
      const body = (documentState.body || '').toLowerCase();
      const matchedContentKeywords = conditions.content_keywords.filter(kw =>
        body.includes(kw.toLowerCase())
      );

      if (matchedContentKeywords.length > 0) {
        score += matchedContentKeywords.length * 10;
        matched_conditions.push(`content_keywords(${matchedContentKeywords.length})`);
      }
    }

    // Check path pattern (25 points)
    if (conditions.path_pattern) {
      const filePath = documentState.path || '';
      if (filePath.includes(conditions.path_pattern)) {
        score += 25;
        matched_conditions.push('path');
      } else {
        failed = true;
      }
    }

    // Check frontmatter fields (40 points per field)
    if (conditions.frontmatter) {
      let frontmatterMatches = 0;
      for (const [key, value] of Object.entries(conditions.frontmatter)) {
        const docValue = documentState.frontmatter?.[key];
        if (docValue === value) {
          frontmatterMatches++;
          score += 40;
        } else {
          failed = true; // Frontmatter fields must match exactly
        }
      }
      if (frontmatterMatches > 0) {
        matched_conditions.push(`frontmatter(${frontmatterMatches})`);
      }
    }

    return {
      matches: !failed && score > 0,
      score: score,
      matched_conditions: matched_conditions
    };
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
