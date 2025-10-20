const BaseAgent = require('../base-agent');
const path = require('path');
const fs = require('fs');

class LinkingAgent extends BaseAgent {
  constructor(vaultPath) {
    super('linking', vaultPath);
    this.glossaryIndex = null;
  }

  /**
   * Main processing logic
   */
  async process(documentState) {
    this.log('info', `Creating links for: ${documentState.path}`);

    // 1. Load glossary index
    await this.loadGlossaryIndex();

    if (!this.glossaryIndex || this.glossaryIndex.items.length === 0) {
      this.log('warn', 'Glossary index is empty, skipping linking');
      return {
        links_created: 0,
        unlinked_keywords: documentState.keywords?.length || 0,
        message: 'Glossary index empty'
      };
    }

    // 2. Get keywords from frontmatter
    const keywords = documentState.keywords || documentState.frontmatter?.keywords || [];
    const concepts = documentState.concepts || documentState.frontmatter?.concepts || [];

    // Combine keywords and concepts
    const termsToLink = [...new Set([...keywords, ...concepts])];

    if (termsToLink.length === 0) {
      this.log('warn', 'No keywords or concepts to link');
      return {
        links_created: 0,
        unlinked_keywords: 0,
        message: 'No keywords available'
      };
    }

    // 3. Find matches in glossary
    const matches = this.findMatches(termsToLink);

    // 4. Create wiki links in body
    let linkedBody = documentState.body;
    const linkedConcepts = [];
    const unlinkedKeywords = [];

    for (const term of termsToLink) {
      const match = matches.get(term.toLowerCase());

      if (match) {
        // Create wiki link (only first occurrence)
        const linkedBodyBefore = linkedBody;
        linkedBody = this.createWikiLink(linkedBody, term, match.title);

        if (linkedBody !== linkedBodyBefore) {
          linkedConcepts.push(match.title);
          this.log('info', `Linked: ${term} -> [[${match.title}]]`);
        }
      } else {
        unlinkedKeywords.push(term);
      }
    }

    // 5. Update frontmatter
    const updatedFrontmatter = {
      ...documentState.frontmatter,
      linked_concepts: [...new Set(linkedConcepts)],
      unlinked_keywords: [...new Set(unlinkedKeywords)]
    };

    // 6. Save document
    await this.saveDocument(
      documentState.path,
      updatedFrontmatter,
      linkedBody
    );

    this.log('info', `Created ${linkedConcepts.length} links`);

    return {
      links_created: linkedConcepts.length,
      unlinked_keywords: unlinkedKeywords.length,
      linked_concepts: linkedConcepts
    };
  }

  /**
   * Load glossary index
   */
  async loadGlossaryIndex() {
    try {
      const indexPath = path.join(this.vaultPath, '.obsidian/state/glossary-index.json');

      if (!fs.existsSync(indexPath)) {
        this.log('warn', 'Glossary index not found');
        this.glossaryIndex = { items: [], title_map: {}, alias_map: {} };
        return;
      }

      const data = fs.readFileSync(indexPath, 'utf-8');
      this.glossaryIndex = JSON.parse(data);

      this.log('info', `Loaded glossary index: ${this.glossaryIndex.items.length} items`);
    } catch (error) {
      this.log('error', 'Failed to load glossary index', error);
      this.glossaryIndex = { items: [], title_map: {}, alias_map: {} };
    }
  }

  /**
   * Find matches for terms in glossary
   */
  findMatches(terms) {
    const matches = new Map();

    for (const term of terms) {
      const normalized = term.toLowerCase().trim();

      // Try exact title match
      if (this.glossaryIndex.title_map[normalized]) {
        const filePath = this.glossaryIndex.title_map[normalized];
        const item = this.glossaryIndex.items.find(i => i.file === filePath);
        if (item) {
          matches.set(normalized, item);
          continue;
        }
      }

      // Try alias match
      if (this.glossaryIndex.alias_map[normalized]) {
        const filePath = this.glossaryIndex.alias_map[normalized];
        const item = this.glossaryIndex.items.find(i => i.file === filePath);
        if (item) {
          matches.set(normalized, item);
          continue;
        }
      }

      // Try partial match (for multi-word terms)
      const partialMatch = this.findPartialMatch(term);
      if (partialMatch) {
        matches.set(normalized, partialMatch);
      }
    }

    return matches;
  }

  /**
   * Find partial match in glossary
   */
  findPartialMatch(term) {
    const normalized = term.toLowerCase().trim();

    // Search in titles
    for (const item of this.glossaryIndex.items) {
      if (item.title.toLowerCase() === normalized) {
        return item;
      }
    }

    // Search in aliases
    for (const item of this.glossaryIndex.items) {
      if (item.aliases && item.aliases.some(alias =>
        alias.toLowerCase() === normalized
      )) {
        return item;
      }
    }

    return null;
  }

  /**
   * Create wiki link in body (only first occurrence)
   */
  createWikiLink(body, term, glossaryTitle) {
    // Escape special regex characters in term
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex to match whole word only (case-insensitive)
    const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');

    // Check if already linked
    const alreadyLinked = new RegExp(`\\[\\[.*?${escapedTerm}.*?\\]\\]`, 'i');
    if (alreadyLinked.test(body)) {
      return body; // Already linked, skip
    }

    // Replace first occurrence with wiki link
    const linkedBody = body.replace(regex, `[[${glossaryTitle}]]`);

    return linkedBody;
  }

  /**
   * Check if term is already linked in body
   */
  isAlreadyLinked(body, term) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linkRegex = new RegExp(`\\[\\[.*?${escapedTerm}.*?\\]\\]`, 'i');
    return linkRegex.test(body);
  }

  /**
   * Extract existing links from body
   */
  extractExistingLinks(body) {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(body)) !== null) {
      const linkText = match[1].split('|')[0].trim(); // Handle [[link|display]] format
      links.push(linkText);
    }

    return links;
  }

  /**
   * Calculate link confidence score
   */
  calculateConfidence(term, glossaryItem) {
    let score = 0;

    const termLower = term.toLowerCase();
    const titleLower = glossaryItem.title.toLowerCase();

    // Exact match = highest confidence
    if (termLower === titleLower) {
      score = 1.0;
    }
    // Alias match = high confidence
    else if (glossaryItem.aliases.some(a => a.toLowerCase() === termLower)) {
      score = 0.9;
    }
    // Partial match = medium confidence
    else if (titleLower.includes(termLower) || termLower.includes(titleLower)) {
      score = 0.7;
    }

    return score;
  }
}

module.exports = LinkingAgent;
