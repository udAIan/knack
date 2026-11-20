---
name: knack
description: Manage this folder's agent skills with the knack CLI. Use only in folders set up with knack (a session-start note says so, and the skills repo is in .knack/), to install or remove skills, create, change or delete a skill, review or finish a skill change, or pull skill updates. Also use when the user asks to set up a folder with a skills repo.
compatibility: Requires the knack CLI, git with SSH access to GitHub, and Node 22.18 or newer.
---

# knack

knack keeps a folder's skills in a git repo at `.knack/`, cloned from GitHub. Installed skills are links from `.claude/skills/<name>` and `.agents/skills/<name>` into `.knack/skills/<name>`, so an edit in `.knack/skills/` takes effect in this folder right away.

Run knack commands from the top of the folder.

## Commands

- `knack setup <repo>`: set up this folder with a skills repo, using its SSH address (`git@github.com:<owner>/<repo>.git`). The user creates the repo on GitHub first. It can be empty.
- `knack list`: show the skills in the repo and which ones are installed here.
- `knack install <names>` and `knack remove <names>`: link skills into this folder, or remove the links.
- `knack pull`: get newer skills from GitHub.
- `knack review`, `knack finish`, `knack drop`: send a skill change up, merge it, or throw it away. See [changing skills](references/changing-skills.md).
- `knack update`: update knack itself and this skill.
- `knack check`: runs at session start on its own, so you don't need to run it.

## Rules

- Never pull without asking. When the session-start note says GitHub has newer skills, tell the user and run `knack pull` only if they say yes.
- Never commit to `main` in `.knack/` and never push `main` yourself. Changes go on a branch, then through `knack review` and `knack finish`.
- Ask before `knack drop`, because it throws work away.
- Ask the user before installing anything on their machine, such as a tool a skill needs.
- If a knack command fails, read its message. It says what went wrong and what to do next.

## Changing, creating or deleting a skill

When a skill isn't doing what the user needs, or the way the work is done has changed, change the skill with the user. Read [changing skills](references/changing-skills.md) before you start.

## Writing a skill

Skills must follow the Agent Skills spec exactly and work in every agent. Read [writing skills](references/writing-skills.md) before creating a skill, adding an existing one, or fixing one.
