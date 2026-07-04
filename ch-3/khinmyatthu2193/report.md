# ch-3 Personal Project - Report

github_username: khinmyatthu2193
personal_repo_url: https://github.com/khinmyatthu2193/May_Mays_Latt_Swal-Cooking-Assistant-Web-App
project_summary: MayMay's Latt Swal is a Myanmar-first cooking assistant that suggests meals and matches recipes from ingredients.
slides_url: slides/6x20.md

## Methodology

I built the project as a small working vertical slice instead of a large unfinished app. First I defined a local Myanmar recipe dataset, then implemented deterministic routing for two core user flows: random meal suggestions and ingredient-based recipe search. Claude Code helped scaffold the React/Vite app, create the MCP/skill/agent evidence files, and keep the implementation aligned with the project scope. Human decisions focused on the recipe choices, Myanmar-first UX, and keeping the app useful for quick daily cooking decisions.

## Evidence - Claude Code usage

- .mcp.json
- .claude/skills/recipe-assistant/SKILL.md
- .claude/agents/meal-planner.md

### MCP

- path: .mcp.json
- what: The Filesystem MCP server exposes the local `./data` folder to Claude Code. In this project, it is used for the Myanmar recipe dataset in `data/recipes.json`.

### Skill

- path: .claude/skills/recipe-assistant/SKILL.md
- what: The recipe-assistant skill guides Claude Code to format Myanmar-first recipe summaries and detail responses. It keeps the output practical, mobile-friendly, and based only on the supplied recipe data.

### Agent

- path: .claude/agents/meal-planner.md
- what: The meal-planner agent detects whether the user wants a random meal suggestion or ingredient-based search. It ranks recipes by ingredient matches and passes selected recipes to the recipe-assistant skill.
