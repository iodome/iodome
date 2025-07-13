import { execSync } from "child_process";

function globalSetup() {
  console.time("next build");
  execSync("pnpm build", { stdio: "ignore" });
  console.timeEnd("next build");
}

export default globalSetup;
