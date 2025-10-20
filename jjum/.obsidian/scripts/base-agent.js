const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class BaseAgent {
  constructor(name, vaultPath) {
    this.name = name;
    this.vaultPath = vaultPath || process.cwd();
    this.registry = null;
  }

  /**
   * Initialize agent - load Resource Registry
   */
  async initialize() {
    const ResourceRegistry = require('./resource-registry');
    const registryManager = new ResourceRegistry(this.vaultPath);
    this.registry = await registryManager.load();
  }

  /**
   * Validate input document state
   */
  validateInput(documentState) {
    const required = ['path', 'frontmatter', 'body'];

    for (const field of required) {
      if (documentState[field] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return true;
  }

  /**
   * Load document state from file
   */
  async loadDocumentState(filePath) {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.vaultPath, filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    const stats = fs.statSync(absolutePath);

    return {
      path: filePath,
      absolutePath: absolutePath,
      frontmatter: frontmatter || {},
      body: body.trim(),

      // Processing metadata from previous agents
      keywords: frontmatter.keywords || [],
      linked_concepts: frontmatter.linked_concepts || [],
      unlinked_keywords: frontmatter.unlinked_keywords || [],
      tags: frontmatter.tags || [],

      // Original information
      created: frontmatter.created,
      source: frontmatter.source,

      // File information
      size_bytes: stats.size,
      last_modified: stats.mtime
    };
  }

  /**
   * Save document to file
   */
  async saveDocument(filePath, frontmatter, body) {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.vaultPath, filePath);

    // Ensure frontmatter has basic fields
    if (!frontmatter.created) {
      frontmatter.created = new Date().toISOString();
    }
    frontmatter.modified = new Date().toISOString();

    // Use gray-matter to stringify
    const content = matter.stringify(body, frontmatter);

    // Ensure directory exists
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absolutePath, content, 'utf-8');
  }

  /**
   * Execute agent - main entry point
   */
  async execute(documentState) {
    await this.initialize();

    const startTime = Date.now();

    try {
      // Validate input
      this.validateInput(documentState);

      // Call lifecycle hook
      await this.beforeProcess(documentState);

      // Main processing logic (implemented by subclass)
      const result = await this.process(documentState);

      // Call lifecycle hook
      await this.afterProcess(documentState, result);

      const duration = Date.now() - startTime;

      return {
        agent: this.name,
        status: 'completed',
        duration_ms: duration,
        ...result
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      console.error(`❌ Agent ${this.name} failed:`, error.message);

      return {
        agent: this.name,
        status: 'failed',
        duration_ms: duration,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Lifecycle hook: before processing
   */
  async beforeProcess(documentState) {
    // Override in subclass if needed
  }

  /**
   * Main processing logic - MUST be implemented by subclass
   */
  async process(documentState) {
    throw new Error(`process() must be implemented by ${this.name} agent`);
  }

  /**
   * Lifecycle hook: after processing
   */
  async afterProcess(documentState, result) {
    // Override in subclass if needed
  }

  /**
   * Handle errors with retry logic
   */
  shouldRetry(error) {
    // Retry on network errors, timeout, etc.
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN'
    ];

    return retryableErrors.some(errCode =>
      error.message.includes(errCode) || error.code === errCode
    );
  }

  /**
   * Log agent activity
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`;

    if (level === 'error') {
      console.error(logMessage, data || '');
    } else if (level === 'warn') {
      console.warn(logMessage, data || '');
    } else {
      console.log(logMessage, data || '');
    }
  }

  /**
   * Move file to new location
   */
  async moveFile(sourcePath, destinationPath) {
    const sourceAbsolute = path.isAbsolute(sourcePath)
      ? sourcePath
      : path.join(this.vaultPath, sourcePath);

    const destAbsolute = path.isAbsolute(destinationPath)
      ? destinationPath
      : path.join(this.vaultPath, destinationPath);

    // Ensure destination directory exists
    const destDir = path.dirname(destAbsolute);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Check if destination file already exists
    if (fs.existsSync(destAbsolute)) {
      // Generate unique filename
      const ext = path.extname(destAbsolute);
      const base = path.basename(destAbsolute, ext);
      const dir = path.dirname(destAbsolute);
      let counter = 1;
      let newPath = destAbsolute;

      while (fs.existsSync(newPath)) {
        newPath = path.join(dir, `${base}-${counter}${ext}`);
        counter++;
      }

      this.log('warn', `Destination exists, using: ${newPath}`);
      fs.renameSync(sourceAbsolute, newPath);
      return newPath;
    }

    fs.renameSync(sourceAbsolute, destAbsolute);
    return destAbsolute;
  }

  /**
   * Get resource from registry
   */
  getRegistryResource(resourcePath) {
    const parts = resourcePath.split('.');
    let current = this.registry;

    for (const part of parts) {
      if (current[part] === undefined) {
        return null;
      }
      current = current[part];
    }

    return current;
  }
}

module.exports = BaseAgent;
