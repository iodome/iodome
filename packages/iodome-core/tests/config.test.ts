import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config";

describe("loadConfig", () => {
  it("should throw error when no config file exists", async () => {
    await expect(loadConfig()).rejects.toThrow(
      "No iodome config file found. Create one of: iodome.config.ts, iodome.config.mts, iodome.config.mjs",
    );
  });

  it("should export loadConfig function", () => {
    expect(typeof loadConfig).toBe("function");
  });
});
