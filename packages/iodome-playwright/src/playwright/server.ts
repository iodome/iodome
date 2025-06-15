import { execSync, spawn } from "child_process";
import http from "http";
import { loadConfig } from "../config";

export default class TestServer {
  public id: string;
  public port: number;
  public dbName: string;

  constructor(id: string) {
    this.id = id.replace("-", "_");
    this.port = Math.floor(Math.random() * (39999 - 30001 + 1)) + 30001;
    this.dbName = "";
  }

  async setup() {
    const config = await loadConfig();
    this.dbName = `${config.applicationName}_test`;
    this.setupDb();
    spawn("pnpm", ["start"], {
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

  private async waitForServerReady(timeout = 30000) {
    const start = Date.now();

    return new Promise<void>((resolve, reject) => {
      const check = () => {
        const req = http.get(`http://127.0.0.1:${this.port}`, (res) => {
          if (res.statusCode === 200) {
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
            new Error("Server did not become ready within the timeout period.")
          );
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }
}
