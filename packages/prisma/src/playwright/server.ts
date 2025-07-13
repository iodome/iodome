import { ChildProcess, execSync, spawn } from "child_process";
import http from "http";
import * as net from "net";

export default class TestServer {
  public id: string;
  public port: number;
  public dbName: string;
  public cmd: string;
  private server?: ChildProcess;
  private static instances: Set<TestServer> = new Set();
  private static cleanupSetup = false;

  constructor(id: string) {
    this.id = id.replace("-", "_");
    this.port = 0;
    this.dbName = "iodome_test";
    this.cmd = process.env.CI ? "start" : "dev";
    TestServer.instances.add(this);
    this.setupGlobalCleanup();
  }

  async setup() {
    this.port = await this.getFreePort();
    this.setupDb();
    this.log(`Starting server for test ${this.id} on port ${this.port}`);

    this.server = spawn("pnpm", [this.cmd], {
      env: {
        ...process.env,
        DATABASE_URL: this.url,
        PORT: this.port.toString(),
      },
      stdio: "ignore",
      detached: process.platform !== "win32", // Create new process group on Unix
    });

    this.log(`Server process ${this.server.pid} started for test ${this.id}`);
    await this.waitForServerReady(this.port);
    this.log(`Server ready for test ${this.id}`);
  }

  private setupGlobalCleanup() {
    if (TestServer.cleanupSetup) {
      return;
    }
    TestServer.cleanupSetup = true;

    const cleanup = () => {
      const instanceCount = TestServer.instances.size;
      if (instanceCount > 0) {
        this.log(
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
      this.log(`Killing server process ${this.server.pid}`);
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

  private setupDb() {
    this.log(`Creating test database: ${this.name}`);
    execSync(
      `
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${this.name}' AND pid <> pg_backend_pid();
			"
		`,
      { stdio: "ignore" }
    );
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${this.name}"`, {
      stdio: "ignore",
    });
    execSync(`psql -U postgres -c "CREATE DATABASE ${this.name}"`, {
      stdio: "ignore",
    });
    this.log(`Running Prisma migrations for ${this.name}`);
    execSync(
      `DATABASE_URL=${this.url} pnpm prisma db push --accept-data-loss`,
      { stdio: "ignore" }
    );
    this.log(`Database setup complete for ${this.name}`);
  }

  private cleanupDb() {
    try {
      execSync(
        `
        psql -U postgres -c "
          SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
          WHERE datname = '${this.name}' AND pid <> pg_backend_pid();
        "
      `,
        { stdio: "ignore" }
      );
      execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${this.name}"`, {
        stdio: "ignore",
      });
      this.log(`Dropped test database: ${this.name}`);
    } catch (e) {
      if (process.env.DEBUG_IODOME) {
        console.warn(`Failed to drop test database ${this.name}:`, e);
      }
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

  private log(message: any) {
    if (process.env.DEBUG_IODOME) {
      console.log(message);
    }
  }
}
