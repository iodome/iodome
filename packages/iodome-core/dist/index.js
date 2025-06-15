// src/config.ts
import path from "path";
import { pathToFileURL } from "url";
var cachedConfig = null;
async function loadConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }
  const configPath = path.join(process.cwd(), "iodome.config.ts");
  try {
    const configUrl = pathToFileURL(configPath).href;
    const configModule = await import(configUrl);
    cachedConfig = configModule.default || configModule;
    return cachedConfig;
  } catch (error) {
    throw new Error(
      `Failed to load iodome.config.ts from ${configPath}. Make sure the file exists and exports a valid configuration object.`
    );
  }
}
export {
  loadConfig
};
//# sourceMappingURL=index.js.map