import path from "path";
import { pathToFileURL } from "url";
import { existsSync } from "fs";
import { IodomeConfig } from "./types";

let cachedConfig: IodomeConfig | null = null;

export async function loadConfig(): Promise<IodomeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configFiles = [
    "iodome.config.ts",
    "iodome.config.mts",
    "iodome.config.mjs"
  ];

  let configPath: string | null = null;
  for (const filename of configFiles) {
    const filePath = path.join(process.cwd(), filename);
    if (existsSync(filePath)) {
      configPath = filePath;
      break;
    }
  }

  if (!configPath) {
    throw new Error(
      `No iodome config file found. Create one of: ${configFiles.join(', ')}`
    );
  }

  try {
    const configUrl = pathToFileURL(configPath).href;
    const configModule = await import(configUrl);
    cachedConfig = configModule.default || configModule;
    return cachedConfig!;
  } catch (error) {
    throw new Error(
      `Failed to load ${path.basename(configPath)} from ${configPath}. Make sure the file exists and exports a valid configuration object.`
    );
  }
}