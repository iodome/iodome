import { describe, it, expect, vi } from 'vitest';
import { test } from './fixtures.js';

// Mock @playwright/test
vi.mock('@playwright/test', () => ({
  test: {
    extend: vi.fn((extensions) => extensions)
  }
}));

// Mock @prisma/client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn()
  }))
}));

// Mock ./server
vi.mock('./server.js', () => ({
  default: vi.fn().mockImplementation((testId) => ({
    testId,
    port: 3000,
    setup: vi.fn()
  }))
}));

describe('fixtures', () => {
  it('should export test with extended fixtures', () => {
    expect(test).toBeDefined();
    expect(typeof test).toBe('object');
  });

  it('should have baseURL fixture', () => {
    expect(test.baseURL).toBeDefined();
  });

  it('should have prisma fixture', () => {
    expect(test.prisma).toBeDefined();
  });
});