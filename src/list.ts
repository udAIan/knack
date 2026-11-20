import { AGENT_SKILL_DIRS, ensureSetUp, linkState, listSkills, syncExcludes } from "./folder.ts";

export const list = () => {
  if (!ensureSetUp()) {
    return;
  }
  syncExcludes();

  const skills = listSkills();
  if (skills.length === 0) {
    console.log("No skills in .knack/skills/ yet.");
    return;
  }

  const width = Math.max(...skills.map((name) => name.length)) + 2;
  for (const name of skills) {
    const installed = AGENT_SKILL_DIRS.some((agentDir) => linkState(agentDir, name) === "ours");
    console.log(installed ? `${name.padEnd(width)}installed` : name);
  }
};
