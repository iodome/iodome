import { ChildProcess, execSync, spawn } from "child_process";
import http from "http";
import * as net from "net";
import { getTemplateDbName } from "../playwright/utils";
import Logger from "./logger";
import PostgresClient from "./postgres-client";

export default class TestServer {
  public id: string;
  public port: number;
  public dbName: string;
  public cmd: string;
  private server?: ChildProcess;
  private static instances: Set<TestServer> = new Set();
  private static cleanupSetup = false;
  private static templateDbName: string | null = null;
  private static templateReady = false;

  constructor(id: string) {
    this.id = id.replace("-", "_");
    this.port = 0;
    this.dbName = "iodome_test";
    this.cmd = process.env.CI || process.env.IODOME_BUILD ? "start" : "dev";
    TestServer.instances.add(this);
    this.setupGlobalCleanup();
  }

  async setup() {
    this.port = await this.getFreePort();
    await this.setupDb();
    Logger.log(`Starting server for test ${this.id} on port ${this.port}`);

    this.server = spawn("pnpm", [this.cmd], {
      env: {
        ...process.env,
        DATABASE_URL: this.url,
        PORT: this.port.toString(),
      },
      stdio: "ignore",
      detached: process.platform !== "win32",
    });

    Logger.log(`Server process ${this.server.pid} started for test ${this.id}`);
    await this.waitForServerReady();
    Logger.log(`Server ready for test ${this.id}`);
  }

  private setupGlobalCleanup() {
    if (TestServer.cleanupSetup) {
      return;
    }
    TestServer.cleanupSetup = true;

    const cleanup = () => {
      const instanceCount = TestServer.instances.size;
      if (instanceCount > 0) {
        Logger.log(
          `Cleaning up ${instanceCount} test server${
            instanceCount === 1 ? "" : "s"
          }...`
        );
      }
      TestServer.instances.forEach((instance) => {
        instance.cleanup();
      });
    };

    process.once("SIGINT", () => {
      cleanup();
      process.exit(0);
    });
    process.once("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });
    process.once("exit", cleanup);
    process.once("uncaughtException", (err) => {
      console.error("Uncaught exception:", err);
      cleanup();
      process.exit(1);
    });
    process.once("unhandledRejection", (err) => {
      console.error("Unhandled rejection:", err);
      cleanup();
      process.exit(1);
    });
  }

  async cleanup() {
    TestServer.instances.delete(this);

    if (this.server && !this.server.killed) {
      Logger.log(`Killing server process ${this.server.pid}`);
      try {
        if (this.server.pid) {
          process.kill(-this.server.pid, "SIGTERM");
        }
      } catch (e) {
        this.server.kill("SIGTERM");
      }

      setTimeout(() => {
        if (this.server && !this.server.killed) {
          try {
            if (this.server.pid) {
              process.kill(-this.server.pid, "SIGKILL");
            }
          } catch (e) {
            this.server.kill("SIGKILL");
          }
        }
      }, 2000);
    }

    this.cleanupDb();
  }

  private get url() {
    return `postgresql://postgres:postgres@localhost:5432/${this.name}?schema=public`;
  }

  private get name() {
    return `${this.dbName}_${this.id}`;
  }

  private async getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.listen(0, () => {
        const address = server.address();
        server.close();
        if (address && typeof address === "object") {
          resolve(address.port);
        } else {
          reject(new Error("Failed to acquire free port"));
        }
      });
    });
  }

  private static getTemplateDbNameCached(): string {
    if (TestServer.templateDbName) {
      return TestServer.templateDbName;
    }
    TestServer.templateDbName = getTemplateDbName();
    return TestServer.templateDbName ?? "";
  }

  private static checkTemplateExists(): boolean {
    if (TestServer.templateReady) {
      return true;
    }

    const templateName = TestServer.getTemplateDbNameCached();
    try {
      TestServer.templateReady =
        PostgresClient.checkIfTemplateExists(templateName);
      return TestServer.templateReady;
    } catch (e) {
      return false;
    }
  }

  private async setupDb() {
    PostgresClient.disconnectAllConnections(this.name);
    PostgresClient.dropDatabaseIfExists(this.name);
    const hasTemplate = TestServer.checkTemplateExists();

    Logger.log(`
      Template exists: ${hasTemplate},
      template name: ${TestServer.templateDbName}
      `);

    if (hasTemplate && TestServer.templateDbName) {
      try {
        PostgresClient.createDatabaseFromTemplate(
          this.name,
          TestServer.templateDbName
        );
      } catch (e) {
        Logger.log(`Template creation failed, falling back to regular setup`);
        PostgresClient.createDatabase(this.name, this.url);
      }
    } else {
      PostgresClient.createDatabase(this.name, this.url);
    }

    Logger.log(`Database setup complete for ${this.name}`);
  }

  private cleanupDb() {
    try {
      PostgresClient.disconnectAllConnections(this.name);
      PostgresClient.dropDatabaseIfExists(this.name);
    } catch (e) {
      Logger.warn(`Failed to drop test database ${this.name}:`, e);
    }
  }

  private async waitForServerReady(timeout = 60000) {
    const start = Date.now();

    return new Promise<void>((resolve, reject) => {
      const check = () => {
        const req = http.get(`http://127.0.0.1:${this.port}`, (res) => {
          if (res.statusCode && res.statusCode < 500) {
            resolve();
          } else {
            retry();
          }
        });
        req.on("error", retry);
        req.end();
      };

      const retry = () => {
        if (Date.now() - start > timeout) {
          reject(
            new Error(
              "Dev server did not become ready within the timeout period."
            )
          );
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }
}
