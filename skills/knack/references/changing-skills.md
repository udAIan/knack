# Changing skills

A change starts from real work, when a skill isn't doing what the user needs or the way the work is done has changed. The user sees each edit right away and refines it. Each step is its own commit, so the history shows why the skill changed.

## Make the change

1. If `.knack/` is on `main`, start a branch named after the change: `git -C .knack switch -c <short-name>`. If it's already on a change branch, keep using it.
2. Edit the skill in `.knack/skills/<name>/`. The change takes effect in this folder right away.
3. Commit each change, and each later refinement, separately: `git -C .knack add -A`, then `git -C .knack commit -m "<message>"`. The message says what went wrong in the work and what changed, for example "Tables came out as plain text; now extract them as CSV".
4. Suggest that the user try the change in a fresh session, since this chat already knows what they want.

To create a skill, add `.knack/skills/<name>/SKILL.md` (see [writing skills](writing-skills.md)), commit it, and run `knack install <name>` so it's live here.

To delete a skill everywhere, run `git -C .knack rm -r skills/<name>`, then commit.

## Send it up

1. When the user is happy, run `knack review` and give them the link it prints, so they can look over the changes on GitHub.
2. When they say it's good, run `knack finish`. It merges the change into `main`, pushes it, and deletes the branch. Other folders get it with `knack pull`.

## Conflicts

`knack finish` first brings newer skills from GitHub into the branch. If they conflict with the change, it stops and lists the files.

1. Open each file and resolve the conflict. When the intent is clear and both sides can be combined, combine them. When it isn't clear, show the user both versions and ask.
2. Run `git -C .knack add -A`, then `git -C .knack commit --no-edit`.
3. Tell the user what you picked, then run `knack finish` again.

## Dropping a change

Run `knack drop` only when the user asks, and confirm first. It deletes the branch and any uncommitted edits.

## Never

- Commit on `main`, or push `main` yourself.
- Force-push, or rewrite commits that were already pushed.
- Change files outside `.knack/` as part of a skill change.
