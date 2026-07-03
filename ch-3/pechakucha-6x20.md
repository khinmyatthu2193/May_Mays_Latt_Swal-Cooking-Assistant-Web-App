---
marp: true
theme: default
paginate: true
auto-advance: 20
---

# MayMay's Latt Swal

Myanmar cooking assistant for fast daily meal decisions.

---

# Problem

Many users know what ingredients they have, but still spend time deciding what to cook.

---

# Solution

The app gives random meal suggestions and ingredient-based recipe matches from a local Myanmar recipe dataset.

---

# Architecture

React UI → filesystem MCP data → `meal-planner` agent logic → `recipe-assistant` skill formatting.

---

# Vertical Slice

Meal suggestion, ingredient search, ranked results, and recipe detail view all work end to end.

---

# Evidence

`.mcp.json`, `.claude/skills/recipe-assistant/SKILL.md`, `.claude/agents/meal-planner.md`, report, and Marp slides are included.
