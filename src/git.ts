import { spawnSync } from "node:child_process";

export const git = (cwd: string, args: string[]) => {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  return { status: result.status, stdout: result.stdout?.trim() ?? "" };
};
