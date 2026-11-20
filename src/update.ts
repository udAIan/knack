import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { git } from "./git.ts";

export const update = () => {
  const before = git(KNACK_ROOT, ["rev-parse", "HEAD"]).stdout;
  const pull = spawnSync("git", ["-C", KNACK_ROOT, "pull", "--ff-only", "--quiet"], { stdio: "inherit" });
  if (pull.status !== 0) {
    console.error('Couldn\'t update knack. Fix the git error above, then run "knack update" again.');
    process.exitCode = 1;
    return;
  }

  // Re-running the installer adds any links a newer version needs. It is safe to run again.
  const install = spawnSync("sh", [join(KNACK_ROOT, "install.sh")], { stdio: ["ignore", "ignore", "inherit"] });
  if (install.status !== 0) {
    console.error(`knack updated, but its install step failed. Fix the error above, then run "sh ${join(KNACK_ROOT, "install.sh")}".`);
    process.exitCode = 1;
    return;
  }

  const after = git(KNACK_ROOT, ["rev-parse", "HEAD"]).stdout;
  console.log(after === before ? "knack is already up to date." : "Updated knack.");
};

const KNACK_ROOT = dirname(import.meta.dirname);
