import { unlinkSync } from "node:fs";
import { join } from "node:path";
import { AGENT_SKILL_DIRS, ensureSetUp, linkState, syncExcludes } from "./folder.ts";

export const remove = (args: string[]) => {
  const names = [...new Set(args)];
  if (names.length === 0) {
    console.error('Usage: knack remove <names...>   (run "knack list" to see what\'s installed)');
    process.exitCode = 1;
    return;
  }
  if (!ensureSetUp()) {
    return;
  }

  const notInstalled = names.filter((name) => !AGENT_SKILL_DIRS.some((agentDir) => linkState(agentDir, name) === "ours"));
  if (notInstalled.length > 0) {
    console.error(`Not installed here: ${notInstalled.join(", ")}. Run "knack list" to see what is.`);
    process.exitCode = 1;
    return;
  }

  for (const name of names) {
    for (const agentDir of AGENT_SKILL_DIRS) {
      if (linkState(agentDir, name) === "ours") {
        unlinkSync(join(agentDir, name));
      }
    }
  }
  syncExcludes();
  console.log(`Removed ${names.join(", ")}.`);
};
