import { spawnSync } from "node:child_process";
import { ensureSetUp, KNACK_DIR } from "./folder.ts";
import { git } from "./git.ts";

export const review = () => {
  const branch = changeBranch();
  if (!branch) {
    return;
  }
  if (!isClean()) {
    fail('There are uncommitted changes in .knack/. Commit them first, then run "knack review" again.');
    return;
  }
  const commits = commitCount(branch);
  if (commits === 0) {
    fail(`There are no commits on ${branch} yet. Commit your change in .knack/ first.`);
    return;
  }
  if (!run(["push", "--quiet", "--set-upstream", "origin", branch])) {
    fail('Couldn\'t push your change. Fix the git error above, then run "knack review" again.');
    return;
  }

  const origin = git(KNACK_DIR, ["remote", "get-url", "origin"]).stdout;
  const repo = origin.match(/github\.com[:/](.+?)(?:\.git)?$/)?.[1];
  const link = repo ? ` Look over the changes: https://github.com/${repo}/compare/main...${branch}` : "";
  console.log(`Pushed ${branch} (${plural(commits, "commit")}).${link}`);
};

export const finish = () => {
  const branch = changeBranch();
  if (!branch) {
    return;
  }
  if (!isClean()) {
    fail("There are uncommitted changes in .knack/. Commit them first (if you're fixing a conflict, finish it and commit).");
    return;
  }
  if (!run(["fetch", "--quiet", "--prune", "origin"])) {
    fail('Couldn\'t reach GitHub. Fix the git error above, then run "knack finish" again.');
    return;
  }
  if (git(KNACK_DIR, ["merge-base", "--is-ancestor", "main", "origin/main"]).status !== 0) {
    fail("Local main in .knack/ has commits that aren't on GitHub. Sort out main first, then run \"knack finish\" again.");
    return;
  }

  // Newer skills from GitHub go into the change branch first, so any conflict gets fixed there.
  if (git(KNACK_DIR, ["merge-base", "--is-ancestor", "origin/main", branch]).status !== 0) {
    if (!run(["merge", "--quiet", "--no-edit", "origin/main"])) {
      const conflicts = git(KNACK_DIR, ["diff", "--name-only", "--diff-filter=U"]).stdout.split("\n").join(", ");
      fail(
        `Your change conflicts with newer skills on GitHub in: ${conflicts}. Fix the conflicts in .knack/, commit, then run "knack finish" again.`,
      );
      return;
    }
  }

  if (!run(["switch", "--quiet", "main"])) {
    fail('Couldn\'t switch .knack/ to main. Fix the git error above, then run "knack finish" again.');
    return;
  }
  const mainBefore = git(KNACK_DIR, ["rev-parse", "HEAD"]).stdout;
  const merged =
    run(["merge", "--quiet", "--ff-only", "origin/main"]) &&
    run(["merge", "--quiet", "--no-ff", "--no-edit", branch]) &&
    run(["push", "--quiet", "origin", "main"]);
  if (!merged) {
    run(["reset", "--quiet", "--hard", mainBefore]);
    run(["switch", "--quiet", branch]);
    fail('Couldn\'t merge and push main. Fix the git error above, then run "knack finish" again. Your change is still on its branch.');
    return;
  }

  run(["branch", "--quiet", "--delete", branch]);
  if (git(KNACK_DIR, ["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${branch}`]).status === 0) {
    if (!run(["push", "--quiet", "origin", "--delete", branch])) {
      console.warn(`Couldn't delete ${branch} on GitHub. You can delete it there.`);
    }
  }
  console.log(`Finished ${branch}: merged into main and pushed. Other folders get it with "knack pull".`);
};

export const drop = () => {
  const branch = changeBranch();
  if (!branch) {
    return;
  }
  const commits = commitCount(branch);
  const dropped =
    run(["reset", "--quiet", "--hard"]) &&
    run(["clean", "--quiet", "-fd"]) &&
    run(["switch", "--quiet", "main"]) &&
    run(["branch", "--quiet", "-D", branch]);
  if (!dropped) {
    fail('Couldn\'t drop the change. Fix the git error above, then run "knack drop" again.');
    return;
  }

  if (git(KNACK_DIR, ["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${branch}`]).status === 0) {
    if (!run(["push", "--quiet", "origin", "--delete", branch])) {
      console.warn(`Couldn't delete ${branch} on GitHub. You can delete it there.`);
    }
  }
  console.log(`Dropped ${branch} (${plural(commits, "commit")}). This folder is back on main.`);
};

const changeBranch = () => {
  if (!ensureSetUp()) {
    return undefined;
  }
  const branch = git(KNACK_DIR, ["symbolic-ref", "--quiet", "--short", "HEAD"]).stdout;
  if (!branch || branch === "main") {
    fail(
      `There's no change in progress: .knack/ is on ${branch || "a detached commit"}. Start one with "git switch -c <name>" in .knack/.`,
    );
    return undefined;
  }
  return branch;
};

const fail = (message: string) => {
  console.error(message);
  process.exitCode = 1;
};

const isClean = () => git(KNACK_DIR, ["status", "--porcelain"]).stdout === "";

const commitCount = (branch: string) => Number(git(KNACK_DIR, ["rev-list", "--count", `main..${branch}`]).stdout);

const run = (args: string[]) => spawnSync("git", ["-C", KNACK_DIR, ...args], { stdio: "inherit" }).status === 0;

const plural = (count: number, word: string) => `${count} ${count === 1 ? word : `${word}s`}`;
