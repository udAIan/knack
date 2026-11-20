import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

export const update = () => {
  const before = git(["rev-parse", "HEAD"]);
  const pull = spawnSync("git", ["-C", KNACK_ROOT, "pull", "--ff-only", "--quiet"], { stdio: "inherit" });
  if (pull.status !== 0) {
    console.error('Couldn\'t update knack. Fix the git error above, then run "knack update" again.');
    process.exitCode = 1;
    return;
  }

  console.log(git(["rev-parse", "HEAD"]) === before ? "knack is already up to date." : "Updated knack.");
};

const KNACK_ROOT = dirname(import.meta.dirname);

const git = (args: string[]) =>
  spawnSync("git", ["-C", KNACK_ROOT, ...args], { encoding: "utf8" }).stdout.trim();
