# CLAUDE.md — MayMay's Latt Swal (မေမေ့လက်စွဲ)

> Myanmar-first cooking assistant — suggest meals, search by ingredients, cook with confidence.

## Project Overview

A lightweight React + Vite web app that helps Myanmar users decide what to cook. Two core flows:
1. **Random meal suggestion** — tap a button, get 3 recipe ideas
2. **Ingredient-based search** — type available ingredients, find matching recipes

Architecture: Deterministic agent (no external API) + local JSON dataset + MCP filesystem.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS + custom CSS (`src/styles.css`) |
| Icons | Lucide React |
| Agent | Custom deterministic agent (`src/agent.js`) |
| Skill | Recipe formatting (`src/skill.js`) |
| Data | Local JSON (`data/recipes.json`, 70 Myanmar recipes) |
| Deployment | Vercel |

## Project Structure

```
├── data/recipes.json          # 70 Myanmar recipes with numeric IDs
├── src/
│   ├── App.jsx                # Main UI — home, search, detail views
│   ├── agent.js               # Intent detection + ingredient scoring + ranking
│   ├── skill.js               # Recipe formatting (difficulty labels, summary)
│   ├── main.jsx               # React entry
│   └── styles.css             # All custom styles (peach/warm theme)
├── .claude/
│   ├── agents/meal-planner.md # Agent definition
│   └── skills/recipe-assistant/SKILL.md
├── .mcp.json                  # MCP filesystem server → ./data
├── feedback-interview.md      # User interview notes (mother, daily cook)
├── project_prd.md             # Full PRD
└── vercel.json                # Deploy config
```

## Key Files

- `src/agent.js` — `mealPlannerAgent(input, recipes)` → detects intent (suggestion vs ingredients), scores recipes by ingredient overlap, returns ranked results
- `src/skill.js` — `formatDifficulty()`, `formatRecipeSummary()`, `formatRecipeDetail()`
- `src/App.jsx` — All UI components: `RecipeCard`, `RecipeDetail`, time filters, thinking animation
- `data/recipes.json` — Each recipe has: `id`, `name_mm`, `ingredients`/`ingredients_mm`/`ingredients_en`, `steps`/`steps_mm`, `time`, `time_minutes`, `difficulty`

## Commands

```bash
npm run dev       # Start dev server (127.0.0.1)
npm run build     # Production build
npm run preview   # Preview production build
```

## Data Quality Status (as of 2026-07-16)

**Current state:** 70 recipes with numeric IDs, ingredients, cooking steps, and video-search keywords. Flow works end-to-end.

**Known issues with recipe data (not realistic enough):**
1. Ingredient lists too short (5-6 items vs real 8-15)
2. Cooking steps too brief (always 3 steps vs real 5-8)
3. No quantities/measurements for ingredients
4. No serving sizes
5. Some cooking times underestimated
6. Missing essential Myanmar condiments (fish sauce, shrimp paste) in many recipes
7. Ingredients too vague ("chicken" instead of "chicken thigh")

See `DATA_IMPROVEMENTS.md` for detailed improvement plan.

## User Feedback (from interview 2026-07-10)

- Random suggestion button works well
- Ingredient search partially works — "ကြက်သား" alone should match all chicken dishes
- Wants time filter (✅ added as quick/medium/slow)
- Wants more recipes (100+)
- Wants food images
- Wants favorites/bookmark feature

## Notes for Future Work

- Recipe data needs realism pass (quantities, longer steps, more ingredients)
- Consider adding recipe images or richer emoji mapping
- Favorites/bookmark feature requested by user
- Expand dataset from 70 → 100+ recipes
