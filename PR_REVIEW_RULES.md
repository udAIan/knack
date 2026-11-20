# PR Review Rules

Rules for LLM-based code review. Flag violations as comments on the relevant lines.

## Product Context

- We are a fast-moving project. Prefer simple solutions that work for 95% of
  normal use. Do not ask for extra code to handle unlikely edge cases.
- knack is a public CLI that people run on their own Mac or Linux machines,
  mostly driven by AI agents. It works inside the user's folders and git repos.
- Still flag real bugs, data loss, leaked secrets or credentials, and security
  problems.

## Execution Boundary

- Review the diff and surrounding code using read-only inspection.
- Do not run builds, tests, lint, typechecks, formatters, the CLI, or project
  scripts.
- CI owns automated validation.

## Severity Levels

- **blocker** — Must fix before merge (bugs, security issues, data loss risks)
- **warning** — Should fix, but not a merge blocker (style violations, minor issues)
- **nit** — Optional improvement, author's discretion

---

## Boundary Map

Use this only to orient reviews. The rules below should catch durable
engineering mistakes, not duplicate the design docs.

- CLI: the commands that run in a user's work folder
- Installer: the one-time machine install and self-update
- Bundled skill: the skill that teaches agents how to use the CLI
- Docs: `docs/`

## 1. Security

- [ ] No secrets, API keys, tokens, private keys, or personal data are committed
- [ ] External commands such as git run with argument lists, never shell strings built from paths or user input
- [ ] GitHub access stays SSH only: no HTTPS remotes, tokens, or `gh`

## 2. User Files And Git

- [ ] Nothing is written, changed, or deleted outside the user's work folder, except by the one-time machine install
- [ ] The user's own files, settings, branches, and uncommitted work are never overwritten or lost; existing settings are merged, not replaced
- [ ] The user's project repo never picks up the tool's own files
- [ ] Multi-step operations check everything first and then act, so a failure leaves things as they were
- [ ] Destructive git operations are deliberate and checked before they run
- [ ] Standard git practice is used instead of custom flows

## 3. CLI Behavior

- [ ] Commands never wait for interactive input and are safe to run again
- [ ] Hooks and background checks are fast, never hang, and stay quiet when there is nothing to report
- [ ] Output is short and plain, readable by both agents and people; errors say what went wrong and what to do next
- [ ] Code works on Mac and Linux using only git, ssh, and Node

## 4. Skills

- [ ] Skills follow the [Agent Skills spec](https://agentskills.io/specification) exactly: only spec fields, a name that matches its folder, relative paths
- [ ] Skill wording works in every supported agent and avoids tool-specific names
- [ ] Agent behavior rules live in the bundled skill; the CLI stays mechanical

## 5. TypeScript And Code Style

- [ ] Code runs directly on Node with no build step and no runtime npm dependencies; Node built-ins only (dev-only type definitions are fine)
- [ ] Only TypeScript syntax that Node can run as-is: no enums, namespaces, or other syntax that needs compiling
- [ ] TypeScript strictness is preserved: no `any`, non-null assertions, or `@ts-ignore` without narrow justification
- [ ] Main exports appear first; helpers and constants follow in call-flow order
- [ ] JavaScript/TypeScript classes are not introduced
- [ ] New abstractions, flags, shared helpers, or compatibility shims are justified by real repetition or a concrete product need

## 6. General Quality

- [ ] No dead code, commented-out code, or TODO comments without a linked issue
- [ ] No leftover debug output
- [ ] Docs are updated when user-facing behavior changes

## 7. AI Agent Instructions

Apply when a PR changes any `AGENTS.md`, `CLAUDE.md`, skill, other AI-agent instruction, or how those instructions are delivered. Review the change as an expert AI engineer in the context of the applicable instruction set the affected agent receives.

- [ ] Instructions are clear, consistent, and do not conflict with or unnecessarily duplicate other applicable instructions
- [ ] Activation, scope, and responsibilities remain coherent across instructions and skills
- [ ] Instructions match the agent’s actual capabilities and do not unintentionally change unrelated behavior
