import { describe, it, expect, vi, beforeEach } from 'vitest';
import TestServer from './server.js';
import { execSync } from 'child_process';
import * as child_process from 'child_process';
import http from 'http';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
  spawn: vi.fn().mockReturnValue({
    on: vi.fn(),
    kill: vi.fn()
  })
}));

// Mock http
vi.mock('http', () => ({
  default: {
    get: vi.fn()
  }
}));

// Mock loadConfig
vi.mock('../config.js', () => ({
  loadConfig: vi.fn().mockResolvedValue({ applicationName: 'test-app' })
}));

describe('TestServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test_db';
  });

  describe('constructor', () => {
    it('should initialize with proper values', () => {
      const server = new TestServer('test-123');
      
      expect(server.id).toBe('test_123');
      expect(server.port).toBeGreaterThanOrEqual(30001);
      expect(server.port).toBeLessThanOrEqual(39999);
      expect(server.dbName).toBe('');
    });

    it('should replace hyphens with underscores in id', () => {
      const server = new TestServer('test-with-hyphens');
      expect(server.id).toBe('test_with-hyphens');
    });
  });

  describe('setup', () => {
    it('should setup database and start server', async () => {
      const server = new TestServer('test-123');
      
      // Mock waitForServerReady to resolve immediately
      server['waitForServerReady'] = vi.fn().mockResolvedValue(undefined);
      
      await server.setup();
      
      expect(server.dbName).toBe('test-app_test');
      expect(execSync).toHaveBeenCalledTimes(4); // setupDb calls
      expect(child_process.spawn).toHaveBeenCalledWith('pnpm', ['start'], expect.any(Object));
    });
  });

  describe('database operations', () => {
    it('should execute correct database commands in setupDb', async () => {
      const server = new TestServer('test-123');
      server.dbName = 'test-app_test';
      server['waitForServerReady'] = vi.fn().mockResolvedValue(undefined);
      
      await server.setup();
      
      const execCalls = vi.mocked(execSync).mock.calls;
      
      // Check pg_terminate_backend call
      expect(execCalls[0][0]).toContain('pg_terminate_backend');
      expect(execCalls[0][0]).toContain('test-app_test_test_123');
      
      // Check DROP DATABASE call
      expect(execCalls[1][0]).toContain('DROP DATABASE IF EXISTS test-app_test_test_123');
      
      // Check CREATE DATABASE call
      expect(execCalls[2][0]).toContain('CREATE DATABASE test-app_test_test_123');
      
      // Check prisma db push call
      expect(execCalls[3][0]).toContain('pnpm prisma db push');
    });
  });
});