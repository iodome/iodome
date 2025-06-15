import { describe, it, expect } from 'vitest';
import { loadConfig } from './config.js';
import path from 'path';

describe('loadConfig', () => {
  it('should throw error when config file does not exist', async () => {
    const configPath = path.join(process.cwd(), 'iodome.config.ts');
    
    await expect(loadConfig()).rejects.toThrow(
      `Failed to load iodome.config.ts from ${configPath}`
    );
  });

  it('should export loadConfig function', () => {
    expect(typeof loadConfig).toBe('function');
  });
});