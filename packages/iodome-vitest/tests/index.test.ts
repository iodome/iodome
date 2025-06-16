import { describe, expect, it } from "vitest";
import { setupTransactionalVitest } from "../src/index";
import setupTransactionalVitestOriginal from "../src/setup";

describe("index exports", () => {
  it("should export setupTransactionalVitest", () => {
    expect(setupTransactionalVitest).toBeDefined();
    expect(typeof setupTransactionalVitest).toBe("function");
  });

  it("should export the same function as vitest/setup", () => {
    expect(setupTransactionalVitest).toBe(setupTransactionalVitestOriginal);
  });
});
