import { describe, it, expect } from 'vitest';
import { setupTransactionalVitest } from './index.js';
import setupTransactionalVitestOriginal from './vitest/setup.js';

describe('index exports', () => {
  it('should export setupTransactionalVitest', () => {
    expect(setupTransactionalVitest).toBeDefined();
    expect(typeof setupTransactionalVitest).toBe('function');
  });

  it('should export the same function as vitest/setup', () => {
    expect(setupTransactionalVitest).toBe(setupTransactionalVitestOriginal);
  });
});