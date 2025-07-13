import { execSync } from "child_process";
import { getTemplateDbName, isPostgres } from "./utils";

function globalSetup() {
  // console.time("next build");
  // execSync("pnpm build", { stdio: "ignore" });
  // console.timeEnd("next build");

  // Create template database for faster test setup
  createTemplateDatabase();
}

function createTemplateDatabase() {
  try {
    if (process.env.DEBUG_IODOME) {
      console.log("Starting template database creation process");
    }

    // Check if PostgreSQL is available
    if (!isPostgres()) {
      if (process.env.DEBUG_IODOME) {
        console.log("PostgreSQL not available, skipping template creation");
      }
      return; // PostgreSQL not available, skip template creation
    }

    if (process.env.DEBUG_IODOME) {
      console.log("PostgreSQL detected, proceeding with template creation");
    }

    const templateName = getTemplateDbName();
    console.log(`Creating template database: ${templateName}`);

    if (process.env.DEBUG_IODOME) {
      console.log(`Checking if template database ${templateName} already exists`);
    }

    // Check if template already exists
    let templateExists = false;
    try {
      const result = execSync(
        `psql -U postgres -tA -c "SELECT 1 FROM pg_database WHERE datname='${templateName}'"`,
        { encoding: "utf8", stdio: "pipe" }
      )
        .toString()
        .trim();
      
      // PostgreSQL returns "1" if database exists, empty string if not
      templateExists = result.includes("1");
      
      if (process.env.DEBUG_IODOME) {
        console.log(`Template existence check result: "${result}", exists: ${templateExists}`);
      }
    } catch (e) {
      templateExists = false;
      if (process.env.DEBUG_IODOME) {
        console.log("Template existence check failed:", e);
      }
    }

    if (templateExists) {
      console.log(`Template database already exists: ${templateName}`);
      return;
    }

    if (process.env.DEBUG_IODOME) {
      console.log(`Creating new template database: ${templateName}`);
    }

    // Create template database
    execSync(`psql -U postgres -c "CREATE DATABASE ${templateName}"`, {
      stdio: "ignore",
    });

    if (process.env.DEBUG_IODOME) {
      console.log(`Template database ${templateName} created, applying schema`);
    }

    // Apply schema to template
    const templateUrl = `postgresql://postgres:postgres@localhost:5432/${templateName}?schema=public`;
    execSync(
      `DATABASE_URL=${templateUrl} pnpm prisma db push --accept-data-loss`,
      { stdio: "ignore" }
    );

    if (process.env.DEBUG_IODOME) {
      console.log(`Schema applied to template database ${templateName}`);
    }

    console.log(`Template database ready: ${templateName}`);
  } catch (e) {
    console.warn("Failed to create template database:", e);
    // Not a fatal error, tests will fall back to regular setup
  }
}

export default globalSetup;
export { createTemplateDatabase };
