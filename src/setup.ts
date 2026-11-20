import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { HOOK_FILES, KNACK_DIR, syncExcludes } from "./folder.ts";
import { git } from "./git.ts";

export const setup = (args: string[]) => {
  const [url] = args;
  if (!url || args.length > 1) {
    console.error("Usage: knack setup <repo>   (for example git@github.com:you/skills.git)");
    process.exitCode = 1;
    return;
  }
  if (/^https?:\/\//.test(url)) {
    console.error("knack only uses SSH. Use the repo's SSH address, for example git@github.com:you/skills.git.");
    process.exitCode = 1;
    return;
  }

  let message = "Set up this folder. Your skills repo is in .knack/.";
  if (existsSync(KNACK_DIR)) {
    const origin = git(KNACK_DIR, ["remote", "get-url", "origin"]);
    if (!existsSync(join(KNACK_DIR, ".git")) || origin.status !== 0) {
      console.error(`${KNACK_DIR}/ already exists here and isn't a skills repo. Move it away, then run this again.`);
      process.exitCode = 1;
      return;
    }
    if (origin.stdout !== url) {
      console.error(`${KNACK_DIR}/ already exists here and uses ${origin.stdout}. Remove it first to use a different repo.`);
      process.exitCode = 1;
      return;
    }
    message = "This folder is already set up.";
  } else {
    const clone = spawnSync("git", ["clone", "--quiet", url, KNACK_DIR], { stdio: "inherit" });
    if (clone.status !== 0) {
      console.error(`Couldn't clone ${url}. Check the address, and that your SSH key is added to GitHub.`);
      process.exitCode = 1;
      return;
    }

    if (git(KNACK_DIR, ["rev-parse", "--verify", "--quiet", "HEAD"]).status !== 0) {
      mkdirSync(join(KNACK_DIR, "skills"));
      writeFileSync(join(KNACK_DIR, "skills", ".gitkeep"), "");
      writeFileSync(join(KNACK_DIR, "README.md"), README);
      const started = [
        ["symbolic-ref", "HEAD", "refs/heads/main"],
        ["add", "--all"],
        ["commit", "--quiet", "--message", "Start skills repo"],
        ["push", "--quiet", "--set-upstream", "origin", "main"],
      ].every((step) => spawnSync("git", ["-C", KNACK_DIR, ...step], { stdio: "inherit" }).status === 0);
      if (!started) {
        rmSync(KNACK_DIR, { recursive: true, force: true });
        console.error("Couldn't start your skills repo. Fix the git error above, then run this again.");
        process.exitCode = 1;
        return;
      }
      message = "Started your skills repo and set up this folder. It's in .knack/.";
    }
  }

  const hooksAdded = HOOK_FILES.filter((file) => addSessionStartHook(file));
  syncExcludes();
  console.log(message);
  if (hooksAdded.includes(".codex/hooks.json")) {
    console.log("In Codex, approve knack's session-start hook once: type /hooks.");
  }
};

// Adds `knack check` as a session-start hook. Claude Code and Codex use the same hooks format.
const addSessionStartHook = (file: string) => {
  if (git(".", ["ls-files", "--error-unmatch", file]).status === 0) {
    console.warn(`${file} is part of this project, so knack didn't add its session-start hook there.`);
    return false;
  }

  let settings: HookSettings = {};
  if (existsSync(file)) {
    try {
      settings = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      console.warn(`${file} isn't valid JSON, so knack didn't add its session-start hook there. Fix it, then run "knack setup" again.`);
      return false;
    }
  }

  const sessionStart = settings.hooks?.SessionStart ?? [];
  if (sessionStart.some((group) => group.hooks?.some((hook) => hook.command === HOOK_COMMAND))) {
    return false;
  }
  settings.hooks = {
    ...settings.hooks,
    SessionStart: [...sessionStart, { hooks: [{ type: "command", command: HOOK_COMMAND, timeout: 30 }] }],
  };
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
  return true;
};

type HookSettings = {
  hooks?: { SessionStart?: { hooks?: { type?: string; command?: string; timeout?: number }[] }[] };
};

const HOOK_COMMAND = "knack check";

const README = `# Skills

Agent skills managed with knack. Each skill lives in \`skills/<name>/SKILL.md\` and follows the [Agent Skills spec](https://agentskills.io/specification).
`;
