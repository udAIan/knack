# Repository Instructions

## Engineering Philosophy

- We are a fast-moving project; optimize for doing less, but doing it well.
- Keep solutions simple and minimal until real requirements prove more is needed.
- Add abstractions, options, or shared plumbing only when repetition or a concrete product need justifies them.
- Preserve correctness and the safety of the user's files in the small set of things we choose to build.
- Prefer clear, boring, maintainable implementation over premature flexibility.
- Prefer standard git practice over custom flows.

## Product Design

- `README.md` describes how knack works. Read it before changing behavior, and update it when user-facing behavior changes.

## Runtime

- TypeScript that Node runs directly: no build step and no runtime npm dependencies. Use Node built-ins only. Dev-only type definitions are fine.
- Support Mac and Linux only.
- Reach GitHub over SSH only. No HTTPS, tokens, or `gh`.

## User's Files

- Never write, change, or delete anything outside the user's work folder, except during the one-time machine install.
- Never overwrite or lose the user's files, settings, or uncommitted work. Merge into existing files instead of replacing them.
- Check everything first, then act, so a failed command leaves things as they were.

## Skills

- Follow the [Agent Skills spec](https://agentskills.io/specification) strictly. No custom files or fields.
- Keep the CLI mechanical. Put agent judgment and behavior rules in the bundled skill.

## Code Ordering

- Put the main export first in a file.
- Define helper functions and constants after the main export.
- Order helpers by first use / call flow.

## Abstractions

- Do not create needless abstractions.
- Prefer inlining single-use logic unless the abstraction is reused or creates a clear domain boundary.
- Never create helpers for single-use logic.
- Write inline code first, infer patterns from real repetition, then propose abstractions to the user instead of creating them yourself.
- Keep things simple.
- Optimize for readable code.

## Colocation

- Prefer colocating code with its usage.
- Place code as close as practical to the command or module that uses it.

## Classes

- Never use JavaScript or TypeScript classes.

## CLI Output

- Keep output short, plain, and functional. Agents and people both read it.
- Error messages say what went wrong and what to do next.

## Git / Review

- Never commit or push changes before the user has reviewed them.
- Never commit or push unless the user explicitly asks for that action in the current turn.
- If a PR request would require creating a commit or pushing local changes, stop and ask the user first.
- Never skip git hooks (`--no-verify`). If the secret check blocks a commit, remove the secret instead.
