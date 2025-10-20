const fs = require('fs');
const path = require('path');

class CompletionLog {
  constructor(vaultPath) {
    this.vaultPath = vaultPath || process.cwd();
    this.logPath = path.join(this.vaultPath, '.obsidian/state/completion-log.json');
  }

  /**
   * Load completion log from file
   */
  async load() {
    try {
      const data = fs.readFileSync(this.logPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load completion log:', error.message);
      return { version: '1.0', completed: [] };
    }
  }

  /**
   * Save completion log to file
   */
  async save(log) {
    try {
      fs.writeFileSync(this.logPath, JSON.stringify(log, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save completion log:', error.message);
      throw error;
    }
  }

  /**
   * Add completed processing record
   */
  async add(processingRecord, finalOutput) {
    const log = await this.load();

    const completedRecord = {
      work_id: processingRecord.work_id,
      file_path: processingRecord.file_path,
      final_path: finalOutput.final_path || processingRecord.file_path,
      started_at: processingRecord.started_at,
      completed_at: processingRecord.completed_at || new Date().toISOString(),
      total_duration_ms: processingRecord.total_duration_ms ||
        (Date.now() - new Date(processingRecord.started_at).getTime()),
      agents_executed: processingRecord.agent_pipeline.map(agent => ({
        name: agent.name,
        status: agent.status,
        duration_ms: agent.duration_ms || 0,
        started_at: agent.started_at,
        completed_at: agent.completed_at
      })),
      metadata: {
        keywords_extracted: finalOutput.keywords_extracted || 0,
        links_created: finalOutput.links_created || 0,
        tags_added: finalOutput.tags_added || [],
        destination_folder: finalOutput.destination_folder || null
      },
      errors: processingRecord.errors || [],
      retries: processingRecord.retries || 0
    };

    log.completed.push(completedRecord);
    await this.save(log);

    console.log(`📊 Added to completion log: ${completedRecord.file_path}`);
    return completedRecord;
  }

  /**
   * Query completion log with filters
   */
  async query(filters = {}) {
    const log = await this.load();
    let results = [...log.completed];

    // Filter by date range
    if (filters.start_date) {
      results = results.filter(r =>
        new Date(r.completed_at) >= new Date(filters.start_date)
      );
    }
    if (filters.end_date) {
      results = results.filter(r =>
        new Date(r.completed_at) <= new Date(filters.end_date)
      );
    }

    // Filter by work_id
    if (filters.work_id) {
      results = results.filter(r => r.work_id === filters.work_id);
    }

    // Filter by file path pattern
    if (filters.file_path_pattern) {
      results = results.filter(r =>
        r.file_path.includes(filters.file_path_pattern) ||
        r.final_path.includes(filters.file_path_pattern)
      );
    }

    // Filter by errors
    if (filters.has_errors) {
      results = results.filter(r => r.errors.length > 0);
    }

    // Filter by retries
    if (filters.has_retries) {
      results = results.filter(r => r.retries > 0);
    }

    // Sort by completed_at (newest first)
    results.sort((a, b) =>
      new Date(b.completed_at) - new Date(a.completed_at)
    );

    // Limit results
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Get statistics from completion log
   */
  async getStatistics(timeRange = null) {
    const log = await this.load();
    let records = [...log.completed];

    // Filter by time range if specified
    if (timeRange) {
      const cutoffDate = new Date();
      switch (timeRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          break;
      }
      records = records.filter(r => new Date(r.completed_at) >= cutoffDate);
    }

    const stats = {
      total_completed: records.length,
      total_errors: records.reduce((sum, r) => sum + r.errors.length, 0),
      total_retries: records.reduce((sum, r) => sum + r.retries, 0),
      average_duration_ms: records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.total_duration_ms, 0) / records.length)
        : 0,
      by_agent: {},
      by_destination: {},
      keywords_total: records.reduce((sum, r) => sum + (r.metadata.keywords_extracted || 0), 0),
      links_total: records.reduce((sum, r) => sum + (r.metadata.links_created || 0), 0),
      success_rate: records.length > 0
        ? Math.round((records.filter(r => r.errors.length === 0).length / records.length) * 100)
        : 0
    };

    // Agent statistics
    records.forEach(record => {
      record.agents_executed.forEach(agent => {
        if (!stats.by_agent[agent.name]) {
          stats.by_agent[agent.name] = {
            total: 0,
            completed: 0,
            failed: 0,
            skipped: 0,
            total_duration_ms: 0
          };
        }
        stats.by_agent[agent.name].total++;
        stats.by_agent[agent.name][agent.status]++;
        stats.by_agent[agent.name].total_duration_ms += agent.duration_ms || 0;
      });
    });

    // Calculate average duration per agent
    Object.keys(stats.by_agent).forEach(agentName => {
      const agent = stats.by_agent[agentName];
      agent.average_duration_ms = agent.total > 0
        ? Math.round(agent.total_duration_ms / agent.total)
        : 0;
    });

    // Destination statistics
    records.forEach(record => {
      const dest = record.metadata.destination_folder || 'unknown';
      stats.by_destination[dest] = (stats.by_destination[dest] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clean up old log entries
   */
  async cleanup(daysToKeep = 30) {
    const log = await this.load();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalCount = log.completed.length;
    log.completed = log.completed.filter(r =>
      new Date(r.completed_at) >= cutoffDate
    );

    const removedCount = originalCount - log.completed.length;

    if (removedCount > 0) {
      await this.save(log);
      console.log(`🧹 Cleaned up ${removedCount} old log entries (kept last ${daysToKeep} days)`);
    }

    return removedCount;
  }

  /**
   * Get recent completions
   */
  async getRecent(limit = 10) {
    const log = await this.load();
    return log.completed
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, limit);
  }

  /**
   * Check if file was already processed
   */
  async wasProcessed(filePath) {
    const log = await this.load();
    return log.completed.some(r =>
      r.file_path === filePath || r.final_path === filePath
    );
  }

  /**
   * Get processing history for a file
   */
  async getFileHistory(filePath) {
    const log = await this.load();
    return log.completed.filter(r =>
      r.file_path === filePath || r.final_path === filePath
    );
  }
}

module.exports = CompletionLog;
