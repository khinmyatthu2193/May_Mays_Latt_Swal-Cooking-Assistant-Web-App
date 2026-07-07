---
marp: true
theme: default
paginate: true
---

# MayMay's Latt Swal — Tech Stack

Myanmar cooking assistant built with Claude Code, MCP, Agent, and Skill.

---

# Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Language | JavaScript (JSX) |
| Data | Local `data/recipes.json` (25+ Myanmar recipes) |
| Deploy | Vercel |

---

# Agent — `meal-planner`

- **Path**: `.claude/agents/meal-planner.md`
- Detects user intent: meal suggestion vs ingredient search
- Loads recipe data through the filesystem MCP
- Routes requests: random selection or ingredient-overlap scoring
- Passes selected recipes to the `recipe-assistant` skill

---

# Skill — `recipe-assistant`

- **Path**: `.claude/skills/recipe-assistant/SKILL.md`
- Formats recipe data into Myanmar-first cooking responses
- Shows Myanmar names and instructions first, English as support
- Keeps output short and practical for mobile reading
- Does not create recipes or change routing logic

---

# MCP — Filesystem

- **Path**: `.mcp.json`
- Exposes the local `./data` folder to Claude Code
- Agent reads `recipes.json` through MCP for recipe data
- No external APIs — all data stays local and offline

---

# Methodology

- **Vertical slice** over large unfinished app
- Built one working flow at a time: suggestion → search → detail
- Human decisions: recipe choices, Myanmar-first UX, scope control
- Claude Code handled: scaffolding, MCP/agent/skill setup, debugging

---

# Trigger Flow

```
User opens app
  → React UI renders home screen
  → User taps "suggest" or enters ingredients
  → meal-planner agent detects intent
  → MCP loads recipes.json
  → Agent ranks/filters recipes
  → recipe-assistant skill formats output
  → Results displayed in UI
```

---

# AI Tools Used

| Tool | Purpose |
|------|---------|
| Claude Code (CLI) | Scaffolding, debugging, code generation |
| Claude Agent | Deterministic recipe routing logic |
| Claude Skill | Myanmar-first recipe formatting |
| MCP Filesystem | Local data access for the agent |

---

# Commands

```bash
npm run dev      # Start dev server on 127.0.0.1:5173
npm run build    # Build production output to dist/
npm run preview  # Preview production build locally
```

---

# Evidence

- `.mcp.json` — MCP filesystem config
- `.claude/agents/meal-planner.md` — Agent definition
- `.claude/skills/recipe-assistant/SKILL.md` — Skill definition
- `data/recipes.json` — Local Myanmar recipe dataset
- `slides/tech-stack.md` — This deck
