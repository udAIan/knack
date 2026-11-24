---
name: knack
description: Use this skill only in folders set up with knack (a session-start note says so, and the skills repo is in .knack/), whenever the user wants to install, remove, create, change or delete a skill, or get newer skills. Trigger when a skill gets something wrong, the user asks to make, fix, add or update a skill, or the session-start note says newer skills are available, including follow-ups such as refining a change, reviewing or merging it, or resolving a conflict, even when the user does not mention knack. Also use it when the user asks to set up a folder with a skills repo.
compatibility: Requires the knack CLI, git with SSH access to GitHub, and Node 22.18 or newer.
---

# knack

knack keeps a folder's skills in a git repo at `.knack/`, cloned from GitHub. Installed skills are links from `.claude/skills/<name>` and `.agents/skills/<name>` into `.knack/skills/<name>`, so an edit in `.knack/skills/` takes effect in this folder right away.

## Commands

- `knack setup <repo>`: set up this folder with a skills repo, using its SSH address (`git@github.com:<owner>/<repo>.git`). The user creates the repo on GitHub first. It can be empty.
- `knack list`: show the skills in the repo and which ones are installed here.
- `knack install <names>` and `knack remove <names>`: link skills into this folder, or remove the links.
- `knack pull`: get newer skills from GitHub.
- `knack review`, `knack finish`, `knack drop`: send a skill change up, merge it, or throw it away. See [changing skills](references/changing-skills.md).
- `knack update`: update knack itself and this skill.
- `knack check`: runs at session start on its own, so you don't need to run it.

## Rules

- Run knack commands from the top of the folder.
- When the session-start note says GitHub has newer skills, tell the user.
- Never run `knack pull` without the user's yes, because they decide when their skills change.
- Never commit to `main` in `.knack/`, because changes reach other folders only after the user reviews them.
- Never push `main` yourself, because `knack finish` checks everything before it pushes.
- Make changes on a branch, then send them up with `knack review` and `knack finish`.
- Ask before `knack drop`, because it throws work away.
- Ask the user before installing anything on their machine, such as a tool a skill needs.
- If a knack command fails, read its message. It says what went wrong and what to do next.

## Changing, creating, adding or deleting a skill

- When a skill isn't doing what the user needs, or the way the work is done has changed, change the skill with the user.
- Read [changing skills](references/changing-skills.md) before you change, create, add or delete a skill.

## Writing a skill

- Follow the Agent Skills spec exactly, so skills work in every agent.
- Read [writing skills](references/writing-skills.md) whenever you create, change or add a skill, including its description.
- Keep using it for follow-up reviews and revisions.
