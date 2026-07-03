# မေမေ့လက်စွဲ

MayMay's Latt Swal is a minimal Myanmar cooking assistant web app built for the ch-3 personal project. It demonstrates a deterministic MCP + Skill + Agent workflow with a local recipe dataset.

## Features

- Random meal suggestion with 3 recipe options
- Ingredient-based recipe search with overlap scoring
- Recipe detail view with Myanmar-first ingredients and steps
- Local offline dataset at `data/recipes.json`
- Claude Code evidence files:
  - `.mcp.json`
  - `.claude/skills/recipe-assistant/SKILL.md`
  - `.claude/agents/meal-planner.md`

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Chapter 3 Files

- Report: `ch-3/khinmyatthu2193/report.md`
- Marp slides: `ch-3/pechakucha-6x20.md`
- Working app source: `src/`
