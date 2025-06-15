import { execSync } from "child_process";

function globalSetup() {
  console.log("playwright testing...");
  console.time("next build");
  execSync("pnpm build", { stdio: "ignore" });
  console.timeEnd("next build");
}

export default globalSetup;
