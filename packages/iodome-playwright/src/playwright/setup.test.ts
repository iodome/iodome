import { describe, it, expect, vi, beforeEach } from 'vitest';
import globalSetup from './setup.js';
import { execSync } from 'child_process';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

describe('globalSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'time').mockImplementation(() => {});
    vi.spyOn(console, 'timeEnd').mockImplementation(() => {});
  });

  it('should be a function', () => {
    expect(typeof globalSetup).toBe('function');
  });

  it('should run build command', () => {
    globalSetup();
    
    expect(execSync).toHaveBeenCalledWith('pnpm build', { stdio: 'ignore' });
  });

  it('should log build progress', () => {
    globalSetup();
    
    expect(console.log).toHaveBeenCalledWith('playwright testing...');
    expect(console.time).toHaveBeenCalledWith('next build');
    expect(console.timeEnd).toHaveBeenCalledWith('next build');
  });
});