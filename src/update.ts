import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { git } from "./git.ts";

export const update = () => {
  const before = git(KNACK_ROOT, ["rev-parse", "HEAD"]).stdout;
  const pull = spawnSync("git", ["-C", KNACK_ROOT, "pull", "--ff-only", "--quiet"], { stdio: "inherit" });
  if (pull.status !== 0) {
    console.error('Couldn\'t update knack. Fix the git error above, then run "knack update" again.');
    process.exitCode = 1;
    return;
  }

  const after = git(KNACK_ROOT, ["rev-parse", "HEAD"]).stdout;
  console.log(after === before ? "knack is already up to date." : "Updated knack.");
};

const KNACK_ROOT = dirname(import.meta.dirname);
