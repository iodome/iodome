import { describe, expectTypeOf, it } from "vitest";
import type { IodomeConfig } from "../src/types";

describe("IodomeConfig type", () => {
  it("should have correct structure", () => {
    const config: IodomeConfig = {
      applicationName: "TestApp",
    };

    expectTypeOf(config).toMatchTypeOf<IodomeConfig>();
    expectTypeOf(config.applicationName).toBeString();
  });

  it("should require applicationName property", () => {
    type ConfigKeys = keyof IodomeConfig;
    expectTypeOf<ConfigKeys>().toEqualTypeOf<"applicationName">();
  });
});
