# Writing skills

Every skill follows the [Agent Skills spec](https://agentskills.io/specification) exactly, so it works in any agent.

## Layout

```
skills/<name>/
├── SKILL.md          required
├── references/       optional: detail the agent reads when needed
├── scripts/          optional: code the agent runs
└── assets/           optional: templates and data
```

## SKILL.md frontmatter

- `name`: 1 to 64 characters, using lowercase letters, numbers and hyphens. It can't start or end with a hyphen or contain two in a row, and it must match the folder name.
- `description`: 1 to 1024 characters. Say what the skill does and when to use it, with the words a user would say.
- Optional: `license`, `compatibility` (up to 500 characters), `metadata` (string keys to string values), and `allowed-tools`.
- No other fields.

## Body

- Write instructions in plain words that work in every agent. Say "read this file" or "run this command", not the name of one agent's tool.
- Keep `SKILL.md` under 500 lines. Move detail into `references/`, and link to it with relative paths, one level deep.
- Use relative paths only. Never use paths into `.claude/` or `.agents/`.

## Tools a skill needs

- List them in `compatibility`, for example: "Requires jq and the Apify CLI."
- In `SKILL.md`, add one line: "If a required tool is missing, follow references/setup.md."
- In `references/setup.md`, give each tool a check command and say what success looks like. Then give install steps for Mac and Linux, each ending with a check. Mark the steps that need the user, such as logins and API keys.
- Never put secrets in a skill.
- Prefer scripts that fetch their own packages, such as `uv run` with inline dependencies or `npx <package>@<version>`, so only base tools need installing.

## Adding an existing skill

Only do this when the user asks. Copy the skill's folder into `.knack/skills/<name>/`, fix anything that breaks the rules above, and add setup notes if it needs tools. Then commit each skill separately, following [changing skills](changing-skills.md).

## Before you commit

Check that the name matches the folder, the description is under 1024 characters, and the frontmatter has only spec fields.
