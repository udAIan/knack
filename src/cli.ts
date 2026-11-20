#!/usr/bin/env node
import { update } from "./update.ts";

const main = (args: string[]) => {
  const [name, ...rest] = args;

  if (!name || name === "help" || name === "--help" || name === "-h") {
    const width = Math.max(...COMMANDS.map((command) => command.usage.length)) + 2;
    const lines = COMMANDS.map((command) => `  ${command.usage.padEnd(width)}${command.summary}`);
    console.log(["Usage: knack <command>   (short alias: knk)", "", "Commands:", ...lines].join("\n"));
    return;
  }

  const command = COMMANDS.find((candidate) => candidate.name === name);
  if (!command) {
    console.error(`Unknown command "${name}". Run "knack help" to see all commands.`);
    process.exitCode = 1;
    return;
  }

  if (!command.run) {
    console.error(`"knack ${command.name}" isn't built yet.`);
    process.exitCode = 1;
    return;
  }

  command.run(rest);
};

type Command = { name: string; usage: string; summary: string; run?: (args: string[]) => void };

const COMMANDS: Command[] = [
  { name: "update", usage: "update", summary: "Update knack and its bundled skill", run: update },
  { name: "setup", usage: "setup <repo>", summary: "Bring your skills repo into this folder" },
  { name: "list", usage: "list", summary: "Show your skills and which ones are installed here" },
  { name: "install", usage: "install <names...>", summary: "Link skills into this folder" },
  { name: "remove", usage: "remove <names...>", summary: "Remove skill links from this folder" },
  { name: "check", usage: "check", summary: "Check GitHub for updates (run by the session-start hook)" },
  { name: "pull", usage: "pull", summary: "Update main with the latest skills" },
  { name: "review", usage: "review", summary: "Push your change branch and print a link to it" },
  { name: "finish", usage: "finish", summary: "Merge your change into main and push it" },
  { name: "drop", usage: "drop", summary: "Throw away your change branch" },
];

main(process.argv.slice(2));
