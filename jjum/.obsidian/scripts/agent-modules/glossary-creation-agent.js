const BaseAgent = require('../base-agent');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const KeywordExtractionAgent = require('./keyword-extraction-agent');

/**
 * AI Agent Knowledge Management System - Glossary Creation Agent
 *
 * Phase 5-2: Automatically creates glossary entries for important concepts
 * discovered in new documents.
 *
 * Design Principle:
 * - Discovers new concepts from content
 * - Creates glossary entries with LLM-generated definitions (when available)
 * - Prevents duplicate glossary items
 * - Maintains audit trail of concept discovery
 */
class GlossaryCreationAgent extends BaseAgent {
  constructor(vaultPath) {
    super('glossary-creation', vaultPath);
    this.glossaryPath = path.join(this.vaultPath, '5_Glossary');
    this.keywordAgent = new KeywordExtractionAgent(vaultPath);
    this.glossaryIndex = this.loadGlossaryIndex();
  }

  /**
   * Load existing glossary terms to prevent duplicates
   */
  loadGlossaryIndex() {
    const index = new Map();

    if (!fs.existsSync(this.glossaryPath)) {
      return index;
    }

    const files = fs.readdirSync(this.glossaryPath)
      .filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(this.glossaryPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        const title = frontmatter.title || file.replace('.md', '');
        const aliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases : [];

        // Index by title (case-insensitive)
        index.set(title.toLowerCase(), {
          title: title,
          file: file,
          aliases: aliases
        });

        // Index by aliases
        aliases.forEach(alias => {
          index.set(alias.toLowerCase(), {
            title: title,
            file: file,
            aliases: aliases
          });
        });
      } catch (error) {
        this.log('warn', `Failed to load glossary file ${file}: ${error.message}`);
      }
    }

    return index;
  }

  /**
   * Process a document and create glossary entries for new concepts
   */
  async process(documentState) {
    this.log('info', `Processing for glossary creation: ${documentState.path}`);

    // 1. Extract keywords from document
    const keywords = this.extractImportantConcepts(documentState.body);

    if (keywords.length === 0) {
      this.log('info', 'No important concepts found');
      return {
        concepts_found: 0,
        new_concepts: 0,
        existing_concepts: 0,
        glossary_created: 0
      };
    }

    // 2. Filter out existing glossary terms
    const { newConcepts, existingConcepts } = this.filterNewConcepts(
      keywords,
      documentState.path
    );

    // 3. Create glossary entries for new concepts
    const created = [];

    for (const concept of newConcepts) {
      try {
        const success = await this.createGlossaryEntry(
          concept,
          documentState.path,
          documentState.body
        );

        if (success) {
          created.push(concept);
          this.glossaryIndex.set(concept.toLowerCase(), {
            title: concept,
            file: `${concept}.md`,
            aliases: []
          });
        }
      } catch (error) {
        this.log('error', `Failed to create glossary for ${concept}: ${error.message}`);
      }
    }

    const result = {
      concepts_found: keywords.length,
      new_concepts: newConcepts.length,
      existing_concepts: existingConcepts.length,
      glossary_created: created.length,
      created_concepts: created
    };

    this.log('info', `Glossary creation complete: ${created.length} entries created`);
    return result;
  }

  /**
   * Extract important concepts from document body
   */
  extractImportantConcepts(text) {
    // Use TF-IDF and noun phrases for concept extraction
    const tfidf = require('natural').TfIdf;
    const compromise = require('compromise');

    // Method 1: TF-IDF keywords
    const tfidfKeywords = this.extractTfIdfConcepts(text);

    // Method 2: Noun phrases (likely to be good concept candidates)
    const nounPhrases = this.extractNounPhraseConcepts(text);

    // Method 3: Capitalized terms (proper nouns/names)
    const capitalizedTerms = this.extractCapitalizedTerms(text);

    // Combine and deduplicate
    const allConcepts = [
      ...tfidfKeywords,
      ...nounPhrases,
      ...capitalizedTerms
    ];

    // Remove duplicates (case-insensitive)
    const uniqueConcepts = [];
    const seen = new Set();

    for (const concept of allConcepts) {
      const lower = concept.toLowerCase();
      if (!seen.has(lower) && concept.length > 2 && concept.length < 50) {
        seen.add(lower);
        uniqueConcepts.push(concept);
      }
    }

    // Limit to top concepts
    return uniqueConcepts.slice(0, 10);
  }

  /**
   * Extract important concepts using TF-IDF
   */
  extractTfIdfConcepts(text) {
    const natural = require('natural');
    const { removeStopwords } = require('stopword');

    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);

    const concepts = [];
    tfidf.listTerms(0).forEach(item => {
      if (item.tfidf >= 0.5 && item.term.length > 2) {
        // Title case
        const concept = item.term
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        concepts.push(concept);
      }
    });

    return concepts.slice(0, 5);
  }

  /**
   * Extract noun phrase concepts
   */
  extractNounPhraseConcepts(text) {
    const compromise = require('compromise');

    const doc = compromise(text);
    const nouns = doc.nouns().out('array');

    // Title case and deduplicate
    const concepts = [];
    const seen = new Set();

    nouns.forEach(noun => {
      const concept = noun
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .trim();

      if (!seen.has(concept.toLowerCase()) && concept.length > 2) {
        seen.add(concept.toLowerCase());
        concepts.push(concept);
      }
    });

    return concepts.slice(0, 5);
  }

  /**
   * Extract capitalized terms (proper nouns)
   */
  extractCapitalizedTerms(text) {
    // Match capitalized phrases (2-3 words)
    const pattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+)?)\b/g;
    const matches = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[1]);
    }

    // Count frequency and keep top ones
    const frequency = {};
    matches.forEach(term => {
      frequency[term] = (frequency[term] || 0) + 1;
    });

    // Return terms appearing 2+ times
    return Object.entries(frequency)
      .filter(([_, count]) => count >= 2)
      .map(([term]) => term)
      .slice(0, 5);
  }

  /**
   * Filter concepts to identify only new ones
   */
  filterNewConcepts(concepts, sourcePath) {
    const newConcepts = [];
    const existingConcepts = [];

    for (const concept of concepts) {
      const lower = concept.toLowerCase();

      if (this.glossaryIndex.has(lower)) {
        existingConcepts.push(concept);
      } else {
        // Additional checks: skip common words and patterns
        if (this.isValidConcept(concept)) {
          newConcepts.push(concept);
        }
      }
    }

    return { newConcepts, existingConcepts };
  }

  /**
   * Check if a concept is valid for glossary creation
   */
  isValidConcept(concept) {
    // Skip very short concepts
    if (concept.length < 3) {
      return false;
    }

    // Skip very long concepts
    if (concept.length > 50) {
      return false;
    }

    // Skip numeric-only concepts
    if (/^\d+$/.test(concept)) {
      return false;
    }

    // Skip common articles and prepositions
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'from'];
    if (commonWords.includes(concept.toLowerCase())) {
      return false;
    }

    return true;
  }

  /**
   * Create a new glossary entry
   */
  async createGlossaryEntry(concept, sourcePath, documentBody) {
    try {
      const fileName = concept.replace(/\s+/g, '-') + '.md';
      const filePath = path.join(this.glossaryPath, fileName);

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        this.log('warn', `Glossary file already exists: ${filePath}`);
        return false;
      }

      // Extract context snippet from document
      const contextSnippet = this.extractContextSnippet(concept, documentBody);

      // Create frontmatter
      const frontmatter = {
        title: concept,
        aliases: [concept.toLowerCase()],
        ai_generated: true,
        ai_generated_at: new Date().toISOString(),
        reference_count: 1,
        source_documents: [sourcePath],
        tags: [],
        related_concepts: []
      };

      // Create content
      const content = this.generateGlossaryContent(concept, contextSnippet);

      // Write file
      const fileContent = matter.stringify(content, frontmatter);
      fs.writeFileSync(filePath, fileContent, 'utf-8');

      this.log('info', `Created glossary entry: ${concept}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to create glossary entry for ${concept}: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract a relevant context snippet for the concept
   */
  extractContextSnippet(concept, documentBody) {
    const regex = new RegExp(`[^.]*${concept}[^.]*\\.`, 'i');
    const match = documentBody.match(regex);

    if (match && match[0]) {
      return match[0].trim();
    }

    // If concept not found, return first paragraph
    const firstParagraph = documentBody.split('\n\n')[0];
    return firstParagraph.substring(0, 200) + '...';
  }

  /**
   * Generate glossary content
   */
  generateGlossaryContent(concept, contextSnippet) {
    const content = `# ${concept}

## Definition

A key concept discovered in the knowledge base.

## Context

${contextSnippet}

## Related Concepts

[To be updated as references are discovered]

## Notes

This entry was automatically created by the Glossary Creation Agent.
It will be updated as more references are discovered.
`;

    return content;
  }

  /**
   * Batch create glossary entries from all documents
   */
  async batchCreateFromDirectory(directoryPath = '1_Projects') {
    this.log('info', `Batch creating glossary entries from ${directoryPath}`);

    const fullPath = path.join(this.vaultPath, directoryPath);

    if (!fs.existsSync(fullPath)) {
      this.log('warn', `Directory not found: ${fullPath}`);
      return {
        total_processed: 0,
        concepts_found: 0,
        glossary_created: 0
      };
    }

    let totalProcessed = 0;
    let totalConceptsFound = 0;
    let totalCreated = 0;

    const processDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const { data: frontmatter, content: body } = matter(content);

            const relativePath = path.relative(this.vaultPath, fullPath)
              .replace(/\\/g, '/');

            const result = this.processSyncContent({
              path: relativePath,
              frontmatter: frontmatter,
              body: body
            });

            totalProcessed++;
            totalConceptsFound += result.concepts_found;
            totalCreated += result.glossary_created;
          } catch (error) {
            this.log('error', `Error processing ${fullPath}: ${error.message}`);
          }
        }
      }
    };

    processDirectory(fullPath);

    return {
      total_processed: totalProcessed,
      concepts_found: totalConceptsFound,
      glossary_created: totalCreated
    };
  }

  /**
   * Synchronous version of process for batch operations
   */
  processSyncContent(documentState) {
    const keywords = this.extractImportantConcepts(documentState.body);

    const { newConcepts, existingConcepts } = this.filterNewConcepts(
      keywords,
      documentState.path
    );

    let created = 0;

    for (const concept of newConcepts) {
      try {
        const success = this.createGlossaryEntrySyncWrapper(
          concept,
          documentState.path,
          documentState.body
        );

        if (success) {
          created++;
          this.glossaryIndex.set(concept.toLowerCase(), {
            title: concept,
            file: `${concept}.md`,
            aliases: []
          });
        }
      } catch (error) {
        this.log('error', `Failed to create glossary for ${concept}: ${error.message}`);
      }
    }

    return {
      concepts_found: keywords.length,
      new_concepts: newConcepts.length,
      existing_concepts: existingConcepts.length,
      glossary_created: created,
      created_concepts: newConcepts.slice(0, created)
    };
  }

  /**
   * Synchronous wrapper for glossary creation (for batch operations)
   */
  createGlossaryEntrySyncWrapper(concept, sourcePath, documentBody) {
    try {
      const fileName = concept.replace(/\s+/g, '-') + '.md';
      const filePath = path.join(this.glossaryPath, fileName);

      if (fs.existsSync(filePath)) {
        return false;
      }

      const contextSnippet = this.extractContextSnippet(concept, documentBody);

      const frontmatter = {
        title: concept,
        aliases: [concept.toLowerCase()],
        ai_generated: true,
        ai_generated_at: new Date().toISOString(),
        reference_count: 1,
        source_documents: [sourcePath],
        tags: [],
        related_concepts: []
      };

      const content = this.generateGlossaryContent(concept, contextSnippet);
      const fileContent = matter.stringify(content, frontmatter);

      fs.writeFileSync(filePath, fileContent, 'utf-8');

      this.log('info', `Created glossary entry: ${concept}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to create glossary entry for ${concept}: ${error.message}`);
      return false;
    }
  }
}

module.exports = GlossaryCreationAgent;
