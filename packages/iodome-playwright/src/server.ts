import { execSync, spawn } from "child_process";
import http from "http";
import * as net from "net";
import { loadConfig } from "./config";

export default class TestServer {
  public id: string;
  public port: number;
  public dbName: string;
  public cmd: string;

  constructor(id: string) {
    this.id = id.replace("-", "_");
    this.port = 0;
    this.dbName = "";
    this.cmd = process.env.CI ? "start" : "dev";
  }

  async setup() {
    const config = await loadConfig();
    this.dbName = `${config.applicationName}_test`;
    this.port = await this.getFreePort();
    this.setupDb();
    spawn("pnpm", [this.cmd], {
      env: {
        ...process.env,
        DATABASE_URL: this.url,
        PORT: this.port.toString(),
      },
      stdio: "ignore",
      detached: false,
    });
    await this.waitForServerReady(this.port);
  }

  private get url() {
    return process.env.DATABASE_URL?.replace(this.dbName, this.name);
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
    execSync(`
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${this.name}' AND pid <> pg_backend_pid();
			"
		`);
    execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS ${this.name}"`);
    execSync(`psql -U postgres -c "CREATE DATABASE ${this.name}"`);
    execSync(`DATABASE_URL=${this.url} pnpm prisma db push --accept-data-loss`);
  }

  private async waitForServerReady(timeout = 60000) {
    const start = Date.now();

    return new Promise<void>((resolve, reject) => {
      const check = () => {
        const req = http.get(`http://127.0.0.1:${this.port}`, (res) => {
          // Dev servers may return various status codes during startup
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
              "Dev server did not become ready within the timeout period.",
            ),
          );
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }
}
