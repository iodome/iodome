import { describe, it, expect, vi, beforeEach } from 'vitest';
import globalTeardown from './teardown.js';
import { execSync } from 'child_process';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn().mockImplementation((cmd) => {
    if (cmd.includes('SELECT datname')) {
      return 'test-app_test_abc123\ntest-app_test_def456\n';
    }
    return '';
  })
}));

// Mock loadConfig
vi.mock('../config.js', () => ({
  loadConfig: vi.fn().mockResolvedValue({ applicationName: 'test-app' })
}));

describe('globalTeardown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be an async function', () => {
    expect(typeof globalTeardown).toBe('function');
    expect(globalTeardown.constructor.name).toBe('AsyncFunction');
  });

  it('should cleanup test databases', async () => {
    await globalTeardown();
    
    expect(execSync).toHaveBeenCalled();
    
    const calls = vi.mocked(execSync).mock.calls;
    
    // Should query for databases
    expect(calls.some(call => 
      call[0].includes('SELECT datname') && call[0].includes("LIKE 'test-app_test_%'")
    )).toBe(true);
    
    // Should terminate connections
    expect(calls.some(call => 
      call[0].includes('pg_terminate_backend')
    )).toBe(true);
    
    // Should drop test databases
    expect(calls.some(call => 
      call[0].includes('DROP DATABASE IF EXISTS')
    )).toBe(true);
  });

  it('should filter databases correctly', async () => {
    vi.mocked(execSync).mockImplementation((cmd) => {
      if (cmd.includes('SELECT datname')) {
        return 'test-app_test_abc123\nother_database\ntest-app_prod\n';
      }
      return '';
    });
    
    await globalTeardown();
    
    // Should only drop databases matching the pattern
    const dropCalls = vi.mocked(execSync).mock.calls.filter(call => 
      call[0].includes('DROP DATABASE')
    );
    
    expect(dropCalls.length).toBe(1);
    expect(dropCalls[0][0]).toContain('test-app_test_abc123');
  });
});