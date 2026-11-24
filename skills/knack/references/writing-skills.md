# Writing skills

## Relationship to other skill-writing skills

- If another skill-writing skill, such as `skill-creator`, is also in use and the two conflict, follow this guide.

## knack details

- Create and edit skills only in `.knack/skills/<name>/`, because agents reach them through links in `.claude/skills/` and `.agents/skills/`.
- Every skill follows the [Agent Skills spec](https://agentskills.io/specification) exactly, so it works in any agent.
- Keep files inside the skill folder.
- Do not add symlinks or paths that lead outside the skill folder.
- Never put secrets in a skill, because skills are shared through GitHub.
- Before you commit, check that the name matches the folder, the description is under 1024 characters, and the frontmatter has only spec fields.

### Layout

```
skills/<name>/
├── SKILL.md          required
├── references/       optional: detail the agent reads when needed
├── scripts/          optional: code the agent runs
└── assets/           optional: templates and data
```

### SKILL.md frontmatter

- `name`: 1 to 64 characters, using lowercase letters, numbers and hyphens. It can't start or end with a hyphen or contain two in a row, and it must match the folder name.
- `description`: 1 to 1024 characters. See "Write effective descriptions" below.
- Optional: `license`, `compatibility` (up to 500 characters), `metadata` (string keys to string values), and `allowed-tools`.
- No other fields.

### Body

- Write instructions in plain words that work in every agent.
- Say "read this file" or "run this command", not the name of one agent's tool.
- Keep `SKILL.md` under 500 lines by moving detail into `references/`.
- Link each main reference file from `SKILL.md`, and say when to read it.
- A reference file may link a file it depends on, if it says exactly when to read it.
- Write every path relative to the skill's folder, even inside reference files, for example `references/models.md`, not `models.md`.
- Never use paths into `.claude/` or `.agents/`, because each agent uses a different folder.

### Tools a skill needs

- List them in `compatibility`, for example: "Requires jq and the Apify CLI."
- In `SKILL.md`, add one line: "If a required tool is missing, follow references/setup.md."
- In `references/setup.md`, give each tool a check command and say what success looks like.
- Give install steps for Mac and Linux, each ending with a check.
- Mark the steps that need the user, such as logins and API keys.
- Prefer scripts that fetch their own packages, such as `uv run` with inline dependencies or `npx <package>@<version>`, so only base tools need installing.

## Write concise, reviewable instructions

### Language

- Write for fast human review.
- Use familiar words and direct verbs.
- Do not use jargon, formal policy language, or abstract wording when common concrete words work.
- Use technical terms only when they are necessary for accuracy.

### Build with the user

- Discuss and agree on the high-level steps first.
- Add only the agreed framework in the first edit.
- Work through one step at a time with the user.
- Discuss sub-steps only when the current step needs them.
- Resolve details from the user's guidance before writing them.
- Write the agreed instructions in short bullets.
- Limit each edit to what the user just approved.

### Formatting

- Write instructions and requirements as bullet points.
- Put one requirement in each bullet.
- Keep each condition next to the action it controls.
- Use paragraphs only for brief context that is not itself an instruction.
- Keep each paragraph to no more than three short sentences.

### What to include

- Write only what is specific to this work, such as its steps, tools, conventions, and tricky cases.
- Leave out general knowledge, such as what a PDF is or how HTTP works.
- Name one tool or way to do each thing.
- Name a second only for a case the first can't handle, for example: "Use pdfplumber to read PDFs. For scanned PDFs, use pytesseract instead."
- When a rule says always, never or must, add a short reason, for example: "Ask before `knack drop`, because it throws work away."

## Write effective descriptions

The description decides whether the skill is loaded. Put all activation guidance in it.

- Write one to three short imperative sentences on one YAML line.
- Stay within the 1,024-character limit.
- State the work the skill performs.
- Describe the user goals and actions that should trigger it.
- Use concrete words that users are likely to write.
- Include representative request wording and common wording variants.
- Include relevant inputs, artifacts, or project states.
- Include follow-up or resume cases that should continue using the skill.
- Cover intended requests even when the user does not name the skill.
- Do not include workflow steps or implementation details.
- If the skill gets used when it shouldn't, say what it is not for, for example: "Do not use it for editing Excel formulas."

Use this pattern when helpful:

`description: Use this skill whenever [user goals or actions]. Trigger when [representative requests, inputs, artifacts, or project states], including [follow-up cases], even when the user does not name the skill explicitly.`

## Multi-step workflows

- Read [Workflow checklists](references/workflow-checklists.md) when authoring a skill with dependent steps, validation or approval gates, or work that must resume after an interruption.

## Keep a gotchas list

- Put facts the agent would otherwise get wrong in a `## Gotchas` section in `SKILL.md`.
- Keep that section in `SKILL.md`, not in a reference file, so the agent reads it before it hits the problem.
- Write each gotcha as a concrete fact, for example: "The `/health` endpoint returns 200 even when the database is down. Use `/ready` instead."
- When the user corrects the agent, suggest adding the correction to the list.

## Make narrow updates

- Treat feedback examples as evidence of the specific problem they show, not as universal rules.
- Change only the behavior the user identified.
- When the user removes a rule, condition, or clause, delete it without adding its opposite.
- Preserve rules and behavior outside the requested change.
- Before finishing, check for new restrictions, reversed rules, or other behavior the user did not request.
