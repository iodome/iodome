import { describe, it, expect, vi } from 'vitest';

describe('Logger', () => {
  it('should export a Logger class', async () => {
    // Simple test to ensure the module loads correctly
    const { default: Logger } = await import('./logger');
    
    expect(Logger).toBeDefined();
    expect(typeof Logger.log).toBe('function');
    expect(typeof Logger.warn).toBe('function');
    expect(typeof Logger.error).toBe('function');
  });

  it('should handle logging without throwing errors', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const { default: Logger } = await import('./logger');
    
    // Should not throw
    expect(() => Logger.log('test message')).not.toThrow();
    
    consoleSpy.mockRestore();
  });
});