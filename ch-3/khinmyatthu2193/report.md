# MayMay's Latt Swal Implementation Report

## What It Does

MayMay's Latt Swal is a Myanmar-first cooking assistant that helps users decide what to cook quickly. A user can request a random meal suggestion or enter available ingredients such as `egg, onion, tomato`; the app then returns ranked local recipes and a detailed recipe view.

## Methodology

I built the project as a small vertical slice instead of many unfinished features. The first step was defining a local recipe schema, then implementing deterministic routing for two intents: meal suggestion and ingredient search. Claude Code helped scaffold the React/Vite project structure, create the MCP/skill/agent evidence files, and keep the implementation aligned with the PRD. Human decisions focused on project scope, Myanmar food selection, and keeping the UI simple enough for daily use.

## MCP / Skill / Agent

- MCP: `.mcp.json` configures the filesystem MCP server to expose `./data`.
- Skill: `.claude/skills/recipe-assistant/SKILL.md` defines the Myanmar-first recipe output format.
- Agent: `.claude/agents/meal-planner.md` defines intent detection, routing, and ingredient scoring rules.

In the runnable frontend, the same responsibilities are mirrored in code:

- `src/agent.js` handles intent detection and recipe matching.
- `src/skill.js` formats recipe summaries and details.
- `src/App.jsx` displays the end-to-end flow.

## Evidence

- `.mcp.json`
- `.claude/skills/recipe-assistant/SKILL.md`
- `.claude/agents/meal-planner.md`
- `data/recipes.json`
- `src/agent.js`
- `src/skill.js`
- `src/App.jsx`
- `ch-3/pechakucha-6x20.md`

## Next Steps

- Add more Myanmar home-cooking recipes to the local dataset.
- Add a small test file for ingredient scoring and intent detection.
