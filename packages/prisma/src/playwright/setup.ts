import { execSync } from "child_process";
import { getTemplateDbName } from "./utils";
import Logger from "../utils/logger";
import PostgresClient from "../utils/postgres-client";

function globalSetup() {
  createTemplateDatabase();
}

function createTemplateDatabase() {
  try {
    if (!PostgresClient.checkIfPostgresExists()) {
      Logger.log("PostgreSQL not available, skipping template creation");
      return;
    }

    Logger.log("PostgreSQL detected, proceeding with template creation");

    const templateName = getTemplateDbName();

    Logger.log(`Creating template database: ${templateName}`);
    Logger.log(`Checking if template database ${templateName} already exists`);

    let templateExists = false;
    try {
      templateExists = PostgresClient.checkIfTemplateExists(templateName);
    } catch (e) {
      templateExists = false;
      Logger.log("Template existence check failed:", e);
    }

    if (templateExists) {
      Logger.log(`Template database already exists: ${templateName}`);
      return;
    }
    const templateUrl = `postgresql://postgres:postgres@localhost:5432/${templateName}?schema=public`;
    PostgresClient.createDatabase(templateName, templateUrl);
  } catch (e) {
    console.warn("Failed to create template database:", e);
  }
}

export default globalSetup;
export { createTemplateDatabase };
