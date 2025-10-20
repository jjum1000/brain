const BaseAgent = require('../base-agent');

class TaggingAgent extends BaseAgent {
  constructor(vaultPath) {
    super('tagging', vaultPath);
    this.tagRules = this.getDefaultTagRules();
  }

  /**
   * Main processing logic
   */
  async process(documentState) {
    this.log('info', `Auto-tagging document: ${documentState.path}`);

    // 1. Get existing tags
    const existingTags = documentState.tags || documentState.frontmatter?.tags || [];

    // 2. Extract tags from keywords
    const keywordTags = this.tagsFromKeywords(
      documentState.keywords || documentState.frontmatter?.keywords || []
    );

    // 3. Extract tags from concepts
    const conceptTags = this.tagsFromConcepts(
      documentState.concepts || documentState.frontmatter?.concepts || []
    );

    // 4. Extract tags from source type
    const sourceTags = this.tagsFromSource(
      documentState.source || documentState.frontmatter?.source
    );

    // 5. Extract tags from content
    const contentTags = this.tagsFromContent(documentState.body);

    // 6. Combine all tags
    const allTags = [
      ...existingTags,
      ...keywordTags,
      ...conceptTags,
      ...sourceTags,
      ...contentTags
    ];

    // 7. Normalize and deduplicate
    const finalTags = this.normalizeTags(allTags);

    // 8. Update frontmatter
    const updatedFrontmatter = {
      ...documentState.frontmatter,
      tags: finalTags
    };

    // 9. Save document
    await this.saveDocument(
      documentState.path,
      updatedFrontmatter,
      documentState.body
    );

    this.log('info', `Added ${finalTags.length - existingTags.length} new tags`);

    return {
      tags_added: finalTags.length - existingTags.length,
      total_tags: finalTags.length,
      tags: finalTags
    };
  }

  /**
   * Get default tag rules
   */
  getDefaultTagRules() {
    return {
      // Keyword -> Tag mapping
      keywords: {
        'react': ['react', 'javascript', 'frontend'],
        'vue': ['vue', 'javascript', 'frontend'],
        'angular': ['angular', 'javascript', 'frontend'],
        'javascript': ['javascript', 'programming'],
        'typescript': ['typescript', 'javascript', 'programming'],
        'python': ['python', 'programming'],
        'java': ['java', 'programming'],
        'golang': ['go', 'programming'],
        'go': ['go', 'programming'],
        'rust': ['rust', 'programming'],
        'css': ['css', 'frontend', 'styling'],
        'html': ['html', 'frontend'],
        'node': ['nodejs', 'backend', 'javascript'],
        'nodejs': ['nodejs', 'backend', 'javascript'],
        'express': ['express', 'nodejs', 'backend'],
        'api': ['api', 'backend'],
        'rest': ['rest-api', 'api', 'backend'],
        'graphql': ['graphql', 'api', 'backend'],
        'database': ['database', 'backend'],
        'sql': ['sql', 'database'],
        'mongodb': ['mongodb', 'database', 'nosql'],
        'postgres': ['postgresql', 'database', 'sql'],
        'postgresql': ['postgresql', 'database', 'sql'],
        'redis': ['redis', 'database', 'cache'],
        'docker': ['docker', 'devops', 'containerization'],
        'kubernetes': ['kubernetes', 'devops', 'orchestration'],
        'aws': ['aws', 'cloud', 'devops'],
        'azure': ['azure', 'cloud', 'devops'],
        'gcp': ['gcp', 'cloud', 'devops'],
        'git': ['git', 'version-control', 'development'],
        'testing': ['testing', 'quality-assurance'],
        'jest': ['jest', 'testing', 'javascript'],
        'webpack': ['webpack', 'build-tools', 'javascript'],
        'vite': ['vite', 'build-tools', 'javascript'],
        'tailwind': ['tailwindcss', 'css', 'styling'],
        'bootstrap': ['bootstrap', 'css', 'frontend']
      },

      // Source type -> Tag mapping
      sources: {
        'git-commit': ['code-change', 'development'],
        'web-clipper': ['web-clip', 'reference'],
        'inbox-file': ['note']
      },

      // Content patterns -> Tags
      patterns: [
        { regex: /tutorial|guide|how to/i, tags: ['tutorial'] },
        { regex: /documentation|docs|reference/i, tags: ['documentation'] },
        { regex: /bug|fix|issue/i, tags: ['bug-fix'] },
        { regex: /refactor|improve|optimize/i, tags: ['refactoring'] },
        { regex: /feature|new|add/i, tags: ['feature'] },
        { regex: /security|vulnerability|exploit/i, tags: ['security'] },
        { regex: /performance|speed|optimization/i, tags: ['performance'] },
        { regex: /design pattern|architecture/i, tags: ['architecture'] }
      ]
    };
  }

  /**
   * Generate tags from keywords
   */
  tagsFromKeywords(keywords) {
    const tags = new Set();

    keywords.forEach(keyword => {
      const normalized = keyword.toLowerCase().trim();

      // Check if keyword matches any rule
      for (const [key, ruleTags] of Object.entries(this.tagRules.keywords)) {
        if (normalized.includes(key)) {
          ruleTags.forEach(tag => tags.add(tag));
        }
      }

      // Also add the keyword itself as a tag if it's a single word
      if (!normalized.includes(' ') && normalized.length > 2) {
        tags.add(normalized);
      }
    });

    return Array.from(tags);
  }

  /**
   * Generate tags from concepts
   */
  tagsFromConcepts(concepts) {
    const tags = new Set();

    concepts.forEach(concept => {
      const normalized = concept.toLowerCase().trim();

      // Check if concept matches any rule
      for (const [key, ruleTags] of Object.entries(this.tagRules.keywords)) {
        if (normalized.includes(key)) {
          ruleTags.forEach(tag => tags.add(tag));
        }
      }
    });

    return Array.from(tags);
  }

  /**
   * Generate tags from source type
   */
  tagsFromSource(source) {
    if (!source) {
      return [];
    }

    const normalized = source.toLowerCase().trim();
    return this.tagRules.sources[normalized] || [];
  }

  /**
   * Generate tags from content analysis
   */
  tagsFromContent(content) {
    const tags = new Set();

    // Apply pattern matching
    this.tagRules.patterns.forEach(pattern => {
      if (pattern.regex.test(content)) {
        pattern.tags.forEach(tag => tags.add(tag));
      }
    });

    return Array.from(tags);
  }

  /**
   * Normalize tags
   */
  normalizeTags(tags) {
    const normalized = new Set();

    tags.forEach(tag => {
      if (!tag) return;

      let cleaned = tag;

      // Convert to string if needed
      if (typeof cleaned !== 'string') {
        cleaned = String(cleaned);
      }

      // Remove # if present
      cleaned = cleaned.replace(/^#/, '');

      // Lowercase
      cleaned = cleaned.toLowerCase();

      // Replace spaces with hyphens
      cleaned = cleaned.replace(/\s+/g, '-');

      // Remove special characters
      cleaned = cleaned.replace(/[^a-z0-9-]/g, '');

      // Remove leading/trailing hyphens
      cleaned = cleaned.replace(/^-+|-+$/g, '');

      // Skip if too short
      if (cleaned.length < 2) {
        return;
      }

      normalized.add(cleaned);
    });

    return Array.from(normalized).sort();
  }

  /**
   * Filter tags by quality
   */
  filterTags(tags) {
    return tags.filter(tag => {
      // Skip very short tags
      if (tag.length < 2) {
        return false;
      }

      // Skip numbers only
      if (/^\d+$/.test(tag)) {
        return false;
      }

      // Skip common words
      const skipWords = ['the', 'and', 'for', 'with', 'this', 'that'];
      if (skipWords.includes(tag.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get tag hierarchy (for nested tags)
   */
  getTagHierarchy(tag) {
    // For tags like "programming/javascript", return parent tags
    if (tag.includes('/')) {
      const parts = tag.split('/');
      const hierarchy = [];

      for (let i = 0; i < parts.length; i++) {
        hierarchy.push(parts.slice(0, i + 1).join('/'));
      }

      return hierarchy;
    }

    return [tag];
  }

  /**
   * Suggest related tags
   */
  suggestRelatedTags(existingTags) {
    const suggestions = new Set();

    existingTags.forEach(tag => {
      // Find related tags based on rules
      for (const [key, ruleTags] of Object.entries(this.tagRules.keywords)) {
        if (tag.includes(key)) {
          ruleTags.forEach(relatedTag => {
            if (!existingTags.includes(relatedTag)) {
              suggestions.add(relatedTag);
            }
          });
        }
      }
    });

    return Array.from(suggestions);
  }
}

module.exports = TaggingAgent;
