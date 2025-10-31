import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryFetch, retryFetchJson, retryGet, retryGetJson, retryPost, retryPostJson } from '@/lib/retryFetch';

describe('retryFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('retryFetch', () => {
    it('should succeed on first attempt', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await retryFetch('https://api.example.com/data');

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await retryFetch('https://api.example.com/data', {}, { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 30 });

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries exceeded', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        retryFetch('https://api.example.com/data', {}, { maxRetries: 2, initialDelayMs: 10, maxDelayMs: 30 })
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry on non-retryable errors', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error('Invalid request'));

      await expect(
        retryFetch('https://api.example.com/data', {}, { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 30 })
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('should handle retryable HTTP status codes (503)', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await retryFetch('https://api.example.com/data', {}, { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 30 });

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable HTTP status codes (400)', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' });

      await expect(
        retryFetch('https://api.example.com/data', {}, { maxRetries: 3, initialDelayMs: 10, maxDelayMs: 30 })
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryFetchJson', () => {
    it('should parse JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
      });

      const result = await retryFetchJson('https://api.example.com/data');

      expect(result).toEqual({ data: 'test' });
    });

    it('should handle JSON parsing errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Invalid JSON');
        },
      });

      await expect(
        retryFetchJson('https://api.example.com/data')
      ).rejects.toThrow();
    });
  });

  describe('retryGet', () => {
    it('should make GET request', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await retryGet('https://api.example.com/data');

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('retryGetJson', () => {
    it('should make GET request and parse JSON', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: 'success' }),
      });

      const result = await retryGetJson('https://api.example.com/data');

      expect(result).toEqual({ result: 'success' });
    });
  });

  describe('retryPost', () => {
    it('should make POST request with body', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
      });

      const body = { test: 'data' };
      const result = await retryPost('https://api.example.com/data', body);

      expect(result.status).toBe(201);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('retryPostJson', () => {
    it('should make POST request and parse JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 123 }),
      });

      const body = { test: 'data' };
      const result = await retryPostJson('https://api.example.com/data', body);

      expect(result).toEqual({ id: 123 });
    });
  });

  describe('retryable status codes', () => {
    it('should retry on 429 (Rate Limit)', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await retryFetch('https://api.example.com/data', {}, { maxRetries: 2, initialDelayMs: 10, maxDelayMs: 30 });

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 502 (Bad Gateway)', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 502, statusText: 'Bad Gateway' })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await retryFetch('https://api.example.com/data', {}, { maxRetries: 2, initialDelayMs: 10, maxDelayMs: 30 });

      expect(result.status).toBe(200);
    });
  });
});
