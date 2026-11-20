import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

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
    writeExcludes();
    console.log("This folder is already set up.");
    return;
  }

  const clone = spawnSync("git", ["clone", "--quiet", url, KNACK_DIR], { stdio: "inherit" });
  if (clone.status !== 0) {
    console.error(`Couldn't clone ${url}. Check the address, and that your SSH key is added to GitHub.`);
    process.exitCode = 1;
    return;
  }

  const isEmpty = git(KNACK_DIR, ["rev-parse", "--verify", "--quiet", "HEAD"]).status !== 0;
  if (isEmpty) {
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
  }

  writeExcludes();
  console.log(
    isEmpty
      ? "Started your skills repo and set up this folder. It's in .knack/."
      : "Set up this folder. Your skills repo is in .knack/.",
  );
};

const KNACK_DIR = ".knack";

const git = (cwd: string, args: string[]) => {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  return { status: result.status, stdout: result.stdout.trim() };
};

// Hides knack's files from the folder's own git repo, if it is one, without touching the project's .gitignore.
// Each folder owns one block, because git worktrees (one per Conductor workspace) share a single exclude file.
const writeExcludes = () => {
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

  const block = [`${BLOCK_START}${folder}`, `/${prefix}${KNACK_DIR}/`, BLOCK_END];
  const next = [...kept, ...(kept.length > 0 ? [""] : []), ...block, ""].join("\n");
  if (next !== current) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, next);
  }
};

const BLOCK_START = "# knack: ";
const BLOCK_END = "# knack end";

const README = `# Skills

Agent skills managed with knack. Each skill lives in \`skills/<name>/SKILL.md\` and follows the [Agent Skills spec](https://agentskills.io/specification).
`;
