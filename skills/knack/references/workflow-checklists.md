# Workflow checklists

- A workflow may contain steps and sub-steps.
- Require the operating agent to copy the checklist into `progress.md` at the top of the work folder and keep the completion state of every step and sub-step current.

## State the workflow goal

- Start with one short sentence describing the result the full workflow should produce.

## Structure the workflow

- Put the complete progress checklist before the step instructions.
- List steps and sub-steps in the order they should be completed.
- Keep each checklist item to a short action.
- Give every checklist item a matching instruction section using the same name and number.
- Put the detailed procedure in its instruction section, not in the checklist.

## Define complete steps

- State what the agent should do in each step and sub-step.
- State what marks each one complete.
- Complete all sub-steps before marking their parent step complete.
- Keep working on the current item until it is complete.
- Move to the next item only after completing the current one.

After drafting each step or sub-step, ask the user:

- Does completing it require a specific chat response?
- How should `progress.md` be updated?
- Put the agreed chat and progress actions under a `When [step or sub-step] is complete` subheading.
- Keep that subheading separate from the core step instructions.

## Brief example

```md
Goal: Produce a complete, reviewed project brief.

Progress:
- [ ] Step 1: Draft the brief
  - [ ] Step 1.1: Check the required sections
- [ ] Step 2: Finish the brief

### Step 1: Draft the brief

- Write the first complete draft.
- Complete when the draft is saved and Step 1.1 is complete.

#### Step 1.1: Check the required sections

- Confirm every required section is present.
- Complete when no required section is missing.

### Step 2: Finish the brief

- Review the draft and correct any remaining problems.
- Complete when the final brief is saved.
```
