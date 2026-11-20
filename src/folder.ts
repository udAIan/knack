import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { git } from "./git.ts";

export const KNACK_DIR = ".knack";
export const AGENT_SKILL_DIRS = [".claude/skills", ".agents/skills"];
export const HOOK_FILES = [".claude/settings.local.json", ".codex/hooks.json"];

export const ensureSetUp = () => {
  if (existsSync(join(KNACK_DIR, ".git"))) {
    return true;
  }
  console.error('This folder isn\'t set up yet. Run "knack setup <repo>" first.');
  process.exitCode = 1;
  return false;
};

export const listSkills = () => {
  const skillsDir = join(KNACK_DIR, "skills");
  if (!existsSync(skillsDir)) {
    return [];
  }
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(skillsDir, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
};

// Links are relative (../../.knack/skills/<name>), so the whole folder can be moved.
export const linkTarget = (name: string) => join("..", "..", KNACK_DIR, "skills", name);

export const linkState = (agentDir: string, name: string) => {
  const path = join(agentDir, name);
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (!stat) {
    return "missing";
  }
  return stat.isSymbolicLink() && readlinkSync(path) === linkTarget(name) ? "ours" : "other";
};

// A link whose skill was deleted from the repo points at nothing, so it gets removed.
export const removeDeadLinks = () => {
  const removed = new Set<string>();
  for (const agentDir of AGENT_SKILL_DIRS) {
    if (!existsSync(agentDir)) {
      continue;
    }
    for (const name of readdirSync(agentDir)) {
      if (linkState(agentDir, name) === "ours" && !existsSync(join(agentDir, name))) {
        unlinkSync(join(agentDir, name));
        removed.add(name);
      }
    }
  }
  return [...removed];
};

// Hides knack's files from the folder's own git repo, if it is one, without touching the project's .gitignore.
// Each folder owns one block, because git worktrees (one per Conductor workspace) share a single exclude file.
export const syncExcludes = () => {
  const excludePath = git(".", ["rev-parse", "--git-path", "info/exclude"]);
  if (excludePath.status !== 0) {
    return;
  }

  const folder = process.cwd();
  const prefix = git(".", ["rev-parse", "--show-prefix"]).stdout;
  const file = resolve(excludePath.stdout);
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";

  const kept: string[] = [];
  let dropping = false;
  for (const line of current.split("\n")) {
    if (line.startsWith(BLOCK_START)) {
      const owner = line.slice(BLOCK_START.length);
      dropping = owner === folder || !existsSync(join(owner, KNACK_DIR));
    }
    if (!dropping) {
      kept.push(line);
    }
    if (line === BLOCK_END) {
      dropping = false;
    }
  }
  while (kept.at(-1) === "") {
    kept.pop();
  }

  const links = AGENT_SKILL_DIRS.flatMap((agentDir) =>
    existsSync(agentDir)
      ? readdirSync(agentDir)
          .filter((name) => linkState(agentDir, name) === "ours")
          .map((name) => `/${prefix}${agentDir}/${name}`)
      : [],
  );
  const hooks = HOOK_FILES.filter((hookFile) => existsSync(hookFile)).map((hookFile) => `/${prefix}${hookFile}`);
  const block = [`${BLOCK_START}${folder}`, `/${prefix}${KNACK_DIR}/`, ...hooks, ...links, BLOCK_END];
  const next = [...kept, ...(kept.length > 0 ? [""] : []), ...block, ""].join("\n");
  if (next !== current) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, next);
  }
};

const BLOCK_START = "# knack: ";
const BLOCK_END = "# knack end";
