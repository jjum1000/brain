const BaseAgent = require('../base-agent');
const natural = require('natural');
const { removeStopwords } = require('stopword');
const compromise = require('compromise');

class KeywordExtractionAgent extends BaseAgent {
  constructor(vaultPath) {
    super('keyword-extraction', vaultPath);
    this.TfIdf = natural.TfIdf;
    this.minScore = 0.5; // Minimum TF-IDF score
    this.maxKeywords = 15; // Maximum number of keywords to extract
  }

  /**
   * Main processing logic
   */
  async process(documentState) {
    this.log('info', `Extracting keywords from: ${documentState.path}`);

    // 1. Extract keywords using multiple methods
    const tfidfKeywords = this.extractTfIdfKeywords(documentState.body);
    const nounPhrases = this.extractNounPhrases(documentState.body);
    const frequentTerms = this.extractFrequentTerms(documentState.body);

    // 2. Combine and rank keywords
    const combinedKeywords = this.combineKeywords(
      tfidfKeywords,
      nounPhrases,
      frequentTerms
    );

    // 3. Extract main concepts (cleaned up keywords)
    const concepts = this.extractConcepts(combinedKeywords);

    // 4. Update frontmatter
    const updatedFrontmatter = {
      ...documentState.frontmatter,
      keywords: combinedKeywords.slice(0, this.maxKeywords),
      concepts: concepts.slice(0, 10)
    };

    // 5. Save document
    await this.saveDocument(
      documentState.path,
      updatedFrontmatter,
      documentState.body
    );

    this.log('info', `Extracted ${combinedKeywords.length} keywords`);

    return {
      keywords_extracted: combinedKeywords.length,
      concepts_extracted: concepts.length,
      top_keywords: combinedKeywords.slice(0, 5)
    };
  }

  /**
   * Extract keywords using TF-IDF
   */
  extractTfIdfKeywords(text) {
    const tfidf = new this.TfIdf();
    tfidf.addDocument(text);

    const keywords = [];
    tfidf.listTerms(0).forEach(item => {
      if (item.tfidf >= this.minScore && item.term.length > 2) {
        keywords.push({
          text: item.term,
          score: item.tfidf,
          method: 'tfidf'
        });
      }
    });

    return keywords;
  }

  /**
   * Extract noun phrases using compromise
   */
  extractNounPhrases(text) {
    const doc = compromise(text);
    const phrases = doc.nouns().out('array');

    const keywords = [];
    const frequency = {};

    // Count frequency of each phrase
    phrases.forEach(phrase => {
      const normalized = phrase.toLowerCase().trim();
      if (normalized.length > 2) {
        frequency[normalized] = (frequency[normalized] || 0) + 1;
      }
    });

    // Convert to keyword objects
    for (const [phrase, count] of Object.entries(frequency)) {
      keywords.push({
        text: phrase,
        score: count,
        method: 'noun-phrase'
      });
    }

    return keywords;
  }

  /**
   * Extract frequent terms
   */
  extractFrequentTerms(text) {
    // Tokenize
    const tokenizer = new natural.WordTokenizer();
    let tokens = tokenizer.tokenize(text.toLowerCase());

    // Remove stopwords
    tokens = removeStopwords(tokens);

    // Filter out short words and non-alphabetic
    tokens = tokens.filter(token =>
      token.length > 2 && /^[a-z]+$/i.test(token)
    );

    // Count frequency
    const frequency = {};
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });

    // Convert to keyword objects
    const keywords = [];
    for (const [term, count] of Object.entries(frequency)) {
      if (count >= 2) { // Minimum frequency of 2
        keywords.push({
          text: term,
          score: count,
          method: 'frequency'
        });
      }
    }

    return keywords;
  }

  /**
   * Combine keywords from different methods
   */
  combineKeywords(tfidfKeywords, nounPhrases, frequentTerms) {
    const keywordMap = new Map();

    // Helper to add or update keyword
    const addKeyword = (keyword) => {
      const key = keyword.text.toLowerCase();

      if (keywordMap.has(key)) {
        const existing = keywordMap.get(key);
        // Combine scores (weighted average)
        existing.score = (existing.score + keyword.score) / 2;
        existing.methods.push(keyword.method);
      } else {
        keywordMap.set(key, {
          text: this.capitalizeKeyword(keyword.text),
          score: keyword.score,
          methods: [keyword.method]
        });
      }
    };

    // Add all keywords
    tfidfKeywords.forEach(addKeyword);
    nounPhrases.forEach(addKeyword);
    frequentTerms.forEach(addKeyword);

    // Convert to array and sort by score
    const combined = Array.from(keywordMap.values());
    combined.sort((a, b) => {
      // Prioritize keywords found by multiple methods
      if (a.methods.length !== b.methods.length) {
        return b.methods.length - a.methods.length;
      }
      // Then by score
      return b.score - a.score;
    });

    // Return just the text
    return combined.map(k => k.text);
  }

  /**
   * Extract main concepts (title-cased, cleaned keywords)
   */
  extractConcepts(keywords) {
    const concepts = new Set();

    keywords.forEach(keyword => {
      // Skip very long keywords (likely not concepts)
      if (keyword.length > 30) {
        return;
      }

      // Title case for concepts
      const concept = keyword
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      concepts.add(concept);
    });

    return Array.from(concepts);
  }

  /**
   * Capitalize keyword appropriately
   */
  capitalizeKeyword(text) {
    // Known acronyms/proper nouns to keep uppercase
    const uppercase = ['api', 'http', 'https', 'url', 'html', 'css', 'js', 'sql', 'rest', 'json', 'xml'];

    const lower = text.toLowerCase();

    if (uppercase.includes(lower)) {
      return lower.toUpperCase();
    }

    // Title case for multi-word phrases
    if (text.includes(' ')) {
      return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    // Capitalize first letter only for single words
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Filter keywords by quality
   */
  filterKeywords(keywords) {
    return keywords.filter(keyword => {
      // Skip if too short
      if (keyword.text.length < 3) {
        return false;
      }

      // Skip if all numbers
      if (/^\d+$/.test(keyword.text)) {
        return false;
      }

      // Skip common words that slip through
      const commonWords = ['like', 'just', 'also', 'make', 'made', 'using', 'used'];
      if (commonWords.includes(keyword.text.toLowerCase())) {
        return false;
      }

      return true;
    });
  }
}

module.exports = KeywordExtractionAgent;
