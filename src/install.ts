import { lstatSync, mkdirSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { AGENT_SKILL_DIRS, ensureSetUp, linkState, linkTarget, listSkills, syncExcludes } from "./folder.ts";

export const install = (args: string[]) => {
  const names = [...new Set(args)];
  if (names.length === 0) {
    console.error('Usage: knack install <names...>   (run "knack list" to see your skills)');
    process.exitCode = 1;
    return;
  }
  if (!ensureSetUp()) {
    return;
  }

  const skills = listSkills();
  const unknown = names.filter((name) => !skills.includes(name));
  if (unknown.length > 0) {
    console.error(`Not in .knack/skills/: ${unknown.join(", ")}. Run "knack list" to see your skills.`);
    process.exitCode = 1;
    return;
  }

  const blocked = names.flatMap((name) =>
    AGENT_SKILL_DIRS.filter((agentDir) => linkState(agentDir, name) === "other").map((agentDir) => join(agentDir, name)),
  );
  if (blocked.length > 0) {
    console.error(`Already exists and isn't a knack link: ${blocked.join(", ")}. Move it away, then run this again.`);
    process.exitCode = 1;
    return;
  }

  const added = names.filter((name) => AGENT_SKILL_DIRS.some((agentDir) => linkState(agentDir, name) === "missing"));
  for (const name of added) {
    for (const agentDir of AGENT_SKILL_DIRS) {
      if (linkState(agentDir, name) === "missing") {
        mkdirSync(agentDir, { recursive: true });
        symlinkSync(linkTarget(name), join(agentDir, name));
      }
    }
  }
  syncExcludes();

  const already = names.filter((name) => !added.includes(name));
  if (added.length > 0) {
    console.log(`Installed ${added.join(", ")}.`);
  }
  if (already.length > 0) {
    console.log(`Already installed: ${already.join(", ")}.`);
  }

  // Claude Code prefers a personal skill over a folder skill with the same name.
  for (const name of names) {
    if (lstatSync(join(homedir(), ".claude", "skills", name), { throwIfNoEntry: false })) {
      console.warn(
        `Note: ~/.claude/skills/${name} also exists. Claude Code uses that copy instead of this folder's until you remove or rename it.`,
      );
    }
  }
};
