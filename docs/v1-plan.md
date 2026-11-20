# knack v1 plan

As of 2026-11-19. The plan is agreed. No code yet.

## What knack is

Your skills live in one private GitHub repo. In any folder where you work, knack brings that repo in as the folder's "brain". It then links the skills you pick, so Claude Code and Codex both use them in that folder.

When a skill gets in your way during real work, you change it right there, try it, and send it back to GitHub. Every other folder can then pull the change.

The problem it solves: your skills and their tools are set up in one agent tool, so trying a new tool or machine means moving everything by hand.

Later, the brain will hold more than skills (for example, memory).

## Ground rules

- Mac and Linux only.
- SSH only. You log in to GitHub with your SSH key. No `gh` and no HTTPS.
- Follow the [Agent Skills spec](https://agentskills.io/specification) exactly. No custom files or fields.
- Agents run knack most of the time. People rarely type its commands.
- Your skills are installed per folder only, never globally, in v1.
- Nothing outside the folder changes, except the one-time install on the machine.
- Use standard git practice. Don't reinvent what git already solves.

## Install on a machine

Needs: git, an SSH key added to GitHub, and Node 22.18 or newer.

```
git clone git@github.com:<owner>/knack.git ~/.local/share/knack
sh ~/.local/share/knack/install.sh
```

The install step is plain `sh`, so it can say clearly when Node is missing or too old. It:

- links `knack` and its short alias `knk` into `~/.local/bin`, and prints the line to add to your shell profile if that folder isn't on your PATH
- links the bundled skill into `~/.claude/skills/knack` and `~/.agents/skills/knack`, pointing at the files in `~/.local/share/knack`

`knack update` pulls `~/.local/share/knack` over SSH, so the CLI and the bundled skill update together.

knack is written in TypeScript that Node runs directly, with no build step and nothing to install from npm to run it. Type definitions for editors are a dev-only extra.

## Set up a folder

First, create an empty private repo for your skills on github.com. You only do this once, because git can't create repos.

Then run `knack setup git@github.com:<you>/<skills-repo>.git` in the folder. It:

- clones your skills repo into `.knack/` (if the repo is empty, it starts it with a `skills/` folder and a README)
- adds a session-start hook for Claude Code (`.claude/settings.local.json`) and for Codex (`.codex/hooks.json`)
- tells you to approve the hook once in Codex, using `/hooks`
- if the folder is a git repo, lists everything it adds in `.git/info/exclude`

```
my-project/                        your work folder
├── .knack/                        your skills repo (has its own git)
│   └── skills/
│       ├── pdf-tools/SKILL.md
│       └── code-review/SKILL.md
├── .claude/
│   ├── settings.local.json        Claude Code hook
│   └── skills/pdf-tools  →  link to .knack/skills/pdf-tools
├── .agents/
│   └── skills/pdf-tools  →  link to .knack/skills/pdf-tools
├── .codex/hooks.json              Codex hook
└── src/ ...                       your actual work
```

What knack writes to `.git/info/exclude`:

```
.knack/
.claude/settings.local.json
.codex/hooks.json
.claude/skills/pdf-tools
.agents/skills/pdf-tools
```

Why `.git/info/exclude` and not `.gitignore`: it works the same way, but it lives inside `.git/` and is never committed, so the project itself doesn't change. Every knack command checks these lines. That takes milliseconds and needs no network, so a folder that becomes a git repo later gets them too.

## Skill format

- Skills follow the Agent Skills spec exactly, and each one lives at `skills/<name>/SKILL.md` in your skills repo.
- A skill that needs tools lists them in the spec's `compatibility` field.
- `SKILL.md` says what to do when a tool is missing: follow `references/setup.md`. That file has the install steps, each ending with a check, and it marks the steps that need you, such as logins and API keys. It only loads when it's needed.
- Wording works in both tools. Say "read this file", not "use the Read tool". Use relative paths only.

## Choosing skills

- `knack list` shows every skill in `.knack/` and marks which ones are installed here.
- `knack install <names>` links each skill into `.claude/skills/` and `.agents/skills/`, one link per skill.
- `knack remove <names>` removes those links. The skill stays in the repo and in your other folders.

Name clash: Claude Code prefers a skill in `~/.claude/skills/` over a folder skill with the same name. knack warns you when that happens. It never touches `~/.claude/skills/`.

## Changing a skill

When a skill gets in your way during real work:

1. The first change starts a branch in `.knack/`, using plain git.
2. Each change and each later refinement is its own commit. The commit message says what went wrong and what changed.
3. Edits take effect in this folder right away, because the links point into `.knack/`. Also try changes in a fresh session, since the chat that made the edit already knows what you wanted.
4. `knack review` pushes the branch and prints a GitHub link where you can look over the changes. Later refinements get pushed to the same branch.
5. `knack finish` merges the branch into `main` with a merge commit that keeps every commit. It pushes `main`, deletes the branch on GitHub and locally, and leaves the folder on `main`.
6. `knack drop` throws a change away. It goes back to `main` and deletes the branch, and the agent asks you first.

Conflicts at `finish`: `finish` first brings newer skills from GitHub into the change branch, so any conflict is fixed there, and then it runs again. The agent fixes conflicts when the intent is clear and asks you when it isn't. Either way, it tells you what it picked before pushing. If pushing `main` fails, `finish` puts `main` back and leaves you on your branch.

Deleting a skill everywhere is just another change: delete its folder on a branch, then run `review` and `finish`.

If you open a PR from the review link, GitHub marks it as merged when `finish` pushes.

## Staying up to date

- At the start of each session, the hook runs `knack check`. It's quick, never asks for input, and stays quiet when you're up to date or offline.
- If GitHub has newer skills, it says so, and the agent tells you. You decide whether to pull. Nothing updates on its own.
- The hook also says that this folder uses knack, so the agent knows the bundled skill applies here.
- `knack pull` only updates `main`. If you're in the middle of a change, your branch stays as it is, and any conflict gets fixed at `finish`.
- After a pull, knack removes links to skills that were deleted from the repo and tells you.

## Bringing in existing skills

This is a one-time job for the agent, not a CLI command. In a folder that's set up, you ask the agent to bring in skills from where they live today, for example `~/.claude/skills/`. It copies the ones you pick into `.knack/skills/`, makes them follow the spec, adds setup notes where they need tools, and commits each one separately. Your originals stay where they are.

## Bundled skill

- It's one short skill named `knack` that ships with the CLI. It's installed globally in `~/.claude/skills/knack` and `~/.agents/skills/knack`, and `knack update` updates it.
- It teaches agents three things: which knack command to run when, the change flow and conflict rules above, and how to write or bring in skills that follow the spec, including setup notes.
- It sets firm rules: never pull without asking, never push to `main` except through `finish`, and ask before running `drop`.
- The details live in reference files that only load when they're needed.
- Its description makes it activate only in folders set up with knack (the hook's message marks them) or when you ask to set up a folder.

## Commands

| Command | When | What it does |
| --- | --- | --- |
| `knack update` | per machine | Pulls the knack repo, which updates the CLI and the bundled skill |
| `knack setup <repo>` | once per folder | Brings your skills repo into `.knack/` and adds the hooks and exclude lines |
| `knack list` | any time | Shows all skills and which ones are installed here |
| `knack install <names>` | any time | Links skills into `.claude/skills/` and `.agents/skills/` |
| `knack remove <names>` | any time | Removes those links |
| `knack check` | session start (run by the hook) | Fixes exclude lines and dead links, and checks GitHub for updates |
| `knack pull` | when you say yes | Updates `main` |
| `knack review` | during a change | Pushes the branch and prints a link to the changes |
| `knack finish` | when a change is done | Merges into `main`, pushes, and deletes the branch |
| `knack drop` | to drop an unwanted change | Goes back to `main` and deletes the branch |

`knk` works as a short alias for every command. Branches and commits use plain git.

## Not in v1

- `gh` and the GitHub API (maybe later)
- Global installs of your own skills (we'll revisit this after real use)
- Memory and other brain features (later)
- Windows, a web app, automatic pulls, version pinning, teams and sharing

## Notes

- Claude Code reads `.claude/skills/`, and Codex reads `.agents/skills/`. Both follow links. If Claude Code ever starts reading `.agents/skills/`, knack can drop the `.claude/skills/` link.
- Codex asks you to approve a new project hook once, using `/hooks`. The hook stays a fixed one-line call to `knack check`, so you only approve it once per folder.

## Build order

Each step works on its own. You can start using knack on real work after step 4.

1. **Skeleton:** the `knack` entry file that Node runs, the command list, and help output.
2. **Machine install:** the install step, which links `knack` and `knk` and gives the PATH hint, plus `update`.
3. **Folder setup:** `setup` clones your repo into `.knack/`, starts an empty repo if needed, and writes the exclude lines.
4. **Choosing skills:** `list`, `install` and `remove`, with links for both agents and the name clash warning.
5. **Fill your skills repo:** you create a new repo and add the skills you want.
6. **Change flow:** `review`, `finish` and `drop`, all checking before they act.
7. **Updates:** `check`, `pull`, the session-start hooks, and cleanup of dead links.
8. **Bundled skill:** the `knack` skill and its reference files, installed globally.
9. **Dogfood:** use it in two folders and on two machines, and fix whatever gets in the way.
10. **Publish:** a README with install steps, then make the repo public.
