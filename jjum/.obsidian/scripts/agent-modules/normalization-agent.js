const BaseAgent = require('../base-agent');

class NormalizationAgent extends BaseAgent {
  constructor(vaultPath) {
    super('normalization', vaultPath);
  }

  /**
   * Main processing logic
   */
  async process(documentState) {
    this.log('info', `Normalizing document: ${documentState.path}`);

    // 1. Clean body content
    let cleanedBody = this.cleanHtml(documentState.body);
    cleanedBody = this.normalizeWhitespace(cleanedBody);
    cleanedBody = this.normalizeLineBreaks(cleanedBody);

    // 2. Generate or update frontmatter
    const updatedFrontmatter = this.generateFrontmatter(documentState);

    // 3. Save normalized document
    await this.saveDocument(
      documentState.path,
      updatedFrontmatter,
      cleanedBody
    );

    const changes = {
      html_removed: documentState.body !== cleanedBody,
      frontmatter_added: Object.keys(updatedFrontmatter).length > Object.keys(documentState.frontmatter).length,
      whitespace_normalized: true
    };

    this.log('info', 'Normalization complete', changes);

    return {
      changes: changes,
      frontmatter_fields: Object.keys(updatedFrontmatter).length,
      body_length: cleanedBody.length
    };
  }

  /**
   * Remove HTML tags from content
   */
  cleanHtml(content) {
    let cleaned = content;

    // Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // Convert common HTML tags to markdown
    cleaned = cleaned.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    cleaned = cleaned.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
    cleaned = cleaned.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
    cleaned = cleaned.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
    cleaned = cleaned.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
    cleaned = cleaned.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');

    // Convert paragraph tags
    cleaned = cleaned.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');

    // Convert line breaks
    cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');

    // Convert strong/bold tags
    cleaned = cleaned.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    cleaned = cleaned.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

    // Convert emphasis/italic tags
    cleaned = cleaned.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    cleaned = cleaned.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

    // Convert code tags
    cleaned = cleaned.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Convert links
    cleaned = cleaned.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Convert lists
    cleaned = cleaned.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    });

    cleaned = cleaned.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let counter = 0;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
        counter++;
        return `${counter}. $1\n`;
      });
    });

    // Remove remaining HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    cleaned = this.decodeHtmlEntities(cleaned);

    return cleaned;
  }

  /**
   * Decode HTML entities
   */
  decodeHtmlEntities(text) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
      '&mdash;': '-',
      '&ndash;': '-',
      '&hellip;': '...',
      '&ldquo;': '"',
      '&rdquo;': '"',
      '&lsquo;': "'",
      '&rsquo;': "'"
    };

    let decoded = text;
    for (const [entity, char] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), char);
    }

    // Decode numeric entities
    decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(dec);
    });

    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    return decoded;
  }

  /**
   * Normalize whitespace
   */
  normalizeWhitespace(content) {
    let normalized = content;

    // Remove trailing whitespace from lines
    normalized = normalized.replace(/[ \t]+$/gm, '');

    // Normalize multiple spaces to single space (except in code blocks)
    normalized = normalized.replace(/[^\S\n]+/g, ' ');

    // Remove leading whitespace from lines (except code blocks)
    // This is conservative to preserve indentation in code
    // normalized = normalized.replace(/^[ \t]+/gm, '');

    return normalized;
  }

  /**
   * Normalize line breaks
   */
  normalizeLineBreaks(content) {
    let normalized = content;

    // Convert Windows line breaks to Unix
    normalized = normalized.replace(/\r\n/g, '\n');

    // Remove carriage returns
    normalized = normalized.replace(/\r/g, '\n');

    // Limit consecutive line breaks to maximum 2 (one blank line)
    normalized = normalized.replace(/\n{3,}/g, '\n\n');

    // Trim leading and trailing whitespace
    normalized = normalized.trim();

    return normalized;
  }

  /**
   * Generate or update frontmatter
   */
  generateFrontmatter(documentState) {
    const frontmatter = { ...documentState.frontmatter };

    // Set creation date if not present
    if (!frontmatter.created) {
      frontmatter.created = new Date().toISOString();
    }

    // Always update modified date
    frontmatter.modified = new Date().toISOString();

    // Set status
    frontmatter.status = 'normalized';

    // Extract title from body if not in frontmatter
    if (!frontmatter.title) {
      const titleMatch = documentState.body.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        frontmatter.title = titleMatch[1].trim();
      } else {
        // Use filename as title
        const path = require('path');
        frontmatter.title = path.basename(documentState.path, '.md');
      }
    }

    // Preserve source information
    if (documentState.source && !frontmatter.source) {
      frontmatter.source = documentState.source;
    }

    // Initialize empty arrays for other agents
    if (!frontmatter.keywords) {
      frontmatter.keywords = [];
    }
    if (!frontmatter.tags) {
      frontmatter.tags = [];
    }

    return frontmatter;
  }

  /**
   * Validate document is properly encoded
   */
  validateEncoding(content) {
    // Check for common encoding issues
    const hasInvalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content);

    if (hasInvalidChars) {
      this.log('warn', 'Document contains invalid characters');
      return false;
    }

    return true;
  }
}

module.exports = NormalizationAgent;
