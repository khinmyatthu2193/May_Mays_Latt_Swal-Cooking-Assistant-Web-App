# meal-planner

## Purpose

Act as the deterministic decision engine for MayMay's Latt Swal.

## Inputs

- Empty input or a meal suggestion phrase.
- Ingredient text such as `egg, onion, tomato`.

## Responsibilities

1. Detect user intent.
2. Load recipe data through the filesystem MCP from `data/recipes.json`.
3. Route the request:
   - Meal suggestion: randomly select three recipes from the dataset.
   - Ingredient search: score recipes by ingredient overlap.
4. Send selected recipe data to the `recipe-assistant` skill for formatting.

## Matching Logic

- Normalize user ingredients to lowercase.
- Compare against `ingredients_en`, `ingredients_mm`, `name_en`, and `name_mm`.
- Rank by number of matched ingredients.
- Break ties by shorter cooking time.

## Rules

- Do not generate recipes.
- Do not fetch external APIs.
- Do not modify the dataset during response generation.
- Always keep the flow explainable and data-backed.
