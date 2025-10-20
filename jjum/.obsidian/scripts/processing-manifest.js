const fs = require('fs');
const path = require('path');

class ProcessingManifest {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.manifestPath = path.join(this.vaultPath, '.obsidian/state/processing-manifest.json');
  }

  /**
   * Load processing manifest from file
   */
  async load() {
    try {
      const data = fs.readFileSync(this.manifestPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load processing manifest:', error.message);
      return { version: '1.0', current_processing: [] };
    }
  }

  /**
   * Load processing manifest synchronously
   */
  loadSync() {
    try {
      const data = fs.readFileSync(this.manifestPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load processing manifest:', error.message);
      return { version: '1.0', current_processing: [] };
    }
  }

  /**
   * Save processing manifest to file
   */
  async save(manifest) {
    try {
      fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save processing manifest:', error.message);
      throw error;
    }
  }

  /**
   * Add new processing item
   */
  async add(workItem) {
    const manifest = await this.load();

    const processing = {
      work_id: workItem.id,
      file_path: workItem.file.path,
      started_at: new Date().toISOString(),
      agent_pipeline: workItem.required_agents.map(name => ({
        name,
        status: 'pending'
      })),
      errors: [],
      retries: 0
    };

    manifest.current_processing.push(processing);
    await this.save(manifest);

    console.log(`📝 Added to processing manifest: ${workItem.file.path}`);
    return processing;
  }

  /**
   * Update agent status
   */
  async updateAgent(workId, agentName, status, output = null) {
    const manifest = await this.load();
    const processing = manifest.current_processing.find(p => p.work_id === workId);

    if (!processing) {
      throw new Error(`Processing item ${workId} not found`);
    }

    const agent = processing.agent_pipeline.find(a => a.name === agentName);

    if (!agent) {
      throw new Error(`Agent ${agentName} not found in pipeline for ${workId}`);
    }

    agent.status = status;

    if (status === 'in-progress') {
      agent.started_at = new Date().toISOString();
      agent.current_step = output?.current_step || null;
    } else if (status === 'completed') {
      agent.completed_at = new Date().toISOString();
      if (agent.started_at) {
        agent.duration_ms = Date.now() - new Date(agent.started_at).getTime();
      }
      agent.output = output;
    } else if (status === 'failed') {
      agent.failed_at = new Date().toISOString();
      agent.error = output;
      processing.errors.push({
        agent: agentName,
        error: output,
        timestamp: new Date().toISOString()
      });
    } else if (status === 'skipped') {
      agent.skipped_at = new Date().toISOString();
      agent.reason = output;
    }

    await this.save(manifest);
  }

  /**
   * Check if all agents in pipeline are complete
   */
  isComplete(workId) {
    const manifest = this.loadSync();
    const processing = manifest.current_processing.find(p => p.work_id === workId);

    if (!processing) {
      return false;
    }

    return processing.agent_pipeline.every(a =>
      a.status === 'completed' || a.status === 'skipped'
    );
  }

  /**
   * Check if any agent has failed
   */
  hasFailed(workId) {
    const manifest = this.loadSync();
    const processing = manifest.current_processing.find(p => p.work_id === workId);

    if (!processing) {
      return false;
    }

    return processing.agent_pipeline.some(a => a.status === 'failed');
  }

  /**
   * Get current processing item by work ID
   */
  async get(workId) {
    const manifest = await this.load();
    return manifest.current_processing.find(p => p.work_id === workId);
  }

  /**
   * Get all processing items
   */
  async getAll() {
    const manifest = await this.load();
    return manifest.current_processing;
  }

  /**
   * Complete processing (remove from manifest)
   */
  async complete(workId, finalOutput) {
    const manifest = await this.load();
    const index = manifest.current_processing.findIndex(p => p.work_id === workId);

    if (index === -1) {
      throw new Error(`Processing item ${workId} not found`);
    }

    const processing = manifest.current_processing.splice(index, 1)[0];
    processing.completed_at = new Date().toISOString();
    processing.total_duration_ms = Date.now() - new Date(processing.started_at).getTime();
    processing.final_output = finalOutput;

    await this.save(manifest);

    console.log(`✅ Completed processing: ${processing.file_path}`);
    return processing;
  }

  /**
   * Remove processing item (for cleanup or errors)
   */
  async remove(workId) {
    const manifest = await this.load();
    const index = manifest.current_processing.findIndex(p => p.work_id === workId);

    if (index === -1) {
      return false;
    }

    manifest.current_processing.splice(index, 1);
    await this.save(manifest);

    return true;
  }

  /**
   * Get next pending agent for a work item
   */
  async getNextPendingAgent(workId) {
    const manifest = await this.load();
    const processing = manifest.current_processing.find(p => p.work_id === workId);

    if (!processing) {
      return null;
    }

    return processing.agent_pipeline.find(a => a.status === 'pending');
  }

  /**
   * Increment retry counter
   */
  async incrementRetry(workId) {
    const manifest = await this.load();
    const processing = manifest.current_processing.find(p => p.work_id === workId);

    if (!processing) {
      throw new Error(`Processing item ${workId} not found`);
    }

    processing.retries = (processing.retries || 0) + 1;
    await this.save(manifest);

    return processing.retries;
  }

  /**
   * Get processing statistics
   */
  async getStats() {
    const manifest = await this.load();

    return {
      total_processing: manifest.current_processing.length,
      by_status: manifest.current_processing.reduce((acc, item) => {
        const completed = item.agent_pipeline.filter(a => a.status === 'completed').length;
        const total = item.agent_pipeline.length;
        const progress = Math.round((completed / total) * 100);

        if (progress === 100) {
          acc.ready_to_complete = (acc.ready_to_complete || 0) + 1;
        } else if (progress > 0) {
          acc.in_progress = (acc.in_progress || 0) + 1;
        } else {
          acc.not_started = (acc.not_started || 0) + 1;
        }

        return acc;
      }, {}),
      errors: manifest.current_processing.reduce((count, item) => count + item.errors.length, 0)
    };
  }
}

module.exports = ProcessingManifest;
