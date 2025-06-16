import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBeforeEach = vi.fn();
const mockAfterEach = vi.fn();

vi.mock("vitest", async () => {
  const actual = await vi.importActual("vitest");
  return {
    ...actual,
    beforeEach: mockBeforeEach,
    afterEach: mockAfterEach,
  };
});

describe("setupTransactionalVitest", () => {
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock PrismaClient
    mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("should be a function", async () => {
    const { default: setupTransactionalVitest } = await import("../src/setup");
    expect(typeof setupTransactionalVitest).toBe("function");
  });

  it("should register beforeEach and afterEach hooks", async () => {
    const { default: setupTransactionalVitest } = await import("../src/setup");

    setupTransactionalVitest(mockPrisma);

    expect(mockBeforeEach).toHaveBeenCalledTimes(1);
    expect(mockAfterEach).toHaveBeenCalledTimes(1);
  });

  it("should begin transaction in beforeEach", async () => {
    const { default: setupTransactionalVitest } = await import("../src/setup");

    setupTransactionalVitest(mockPrisma);

    // Get the callback passed to beforeEach
    const beforeEachCallback = mockBeforeEach.mock.calls[0][0];

    // Execute the callback
    await beforeEachCallback();

    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith`BEGIN;`;
  });

  it("should rollback transaction in afterEach", async () => {
    const { default: setupTransactionalVitest } = await import("../src/setup");

    setupTransactionalVitest(mockPrisma);

    // Get the callback passed to afterEach
    const afterEachCallback = mockAfterEach.mock.calls[0][0];

    // Execute the callback
    await afterEachCallback();

    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith`ROLLBACK;`;
  });

  it("should handle PrismaClient with proper transaction commands", async () => {
    const { default: setupTransactionalVitest } = await import("../src/setup");

    setupTransactionalVitest(mockPrisma);

    const beforeEachCallback = mockBeforeEach.mock.calls[0][0];
    const afterEachCallback = mockAfterEach.mock.calls[0][0];

    // Simulate test lifecycle
    await beforeEachCallback();
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith`BEGIN;`;

    // Clear previous calls
    mockPrisma.$queryRaw.mockClear();

    await afterEachCallback();
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith`ROLLBACK;`;
  });
});
