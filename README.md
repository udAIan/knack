# knack

Keep your agent skills in a GitHub repo, and use them in any folder with Claude Code and Codex.

## How it works

- A skillset is a GitHub repo of [Agent Skills](https://agentskills.io), one per folder under `skills/<name>/`. You can have as many skillsets as you like, for example one for coding and one for writing.
- In a folder where you work, `knack setup` clones a skillset into `.knack/`. `knack install` links the skills you pick into `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex). Nothing outside the folder changes.
- When a skill gets in your way, you change it right there and try it. Then `knack review` and `knack finish` send the change back to GitHub, and your other folders get it with `knack pull`.
- At the start of each session, a hook checks GitHub and tells the agent when newer skills are available. Nothing updates without you saying so.

Agents run knack most of the time. The bundled `knack` skill teaches them how.

## Requirements

- Mac or Linux
- git, with an SSH key added to GitHub (knack only uses SSH)
- Node 22.18 or newer

## Install

```
git clone git@github.com:udAIan/knack.git ~/.local/share/knack
sh ~/.local/share/knack/install.sh
```

This links `knack` (and the short alias `knk`) into `~/.local/bin`, and the bundled skill into `~/.claude/skills/` and `~/.agents/skills/`. If `~/.local/bin` isn't on your PATH, the installer tells you the line to add.

To update later, run `knack update`.

## Set up a folder

1. Create a private repo for your skillset on GitHub. It can be empty.
2. In your folder, run:

   ```
   knack setup git@github.com:<you>/<skillset>.git
   ```

3. In Codex, approve knack's session-start hook once with `/hooks`.

If the folder is a git repo, knack hides its own files from it in `.git/info/exclude`, so your project doesn't change.

## Commands

| Command | What it does |
| --- | --- |
| `knack setup <repo>` | Brings a skillset into this folder |
| `knack list` | Shows the skills and which ones are installed here |
| `knack install <names>` | Links skills into this folder |
| `knack remove <names>` | Removes those links |
| `knack pull` | Gets newer skills from GitHub |
| `knack review` | Pushes your change branch and prints a link to look it over |
| `knack finish` | Merges your change into `main` and pushes it |
| `knack drop` | Throws away your change branch |
| `knack check` | Checks for updates (run by the session-start hook) |
| `knack update` | Updates knack and its bundled skill |

## License

[MIT](LICENSE)
