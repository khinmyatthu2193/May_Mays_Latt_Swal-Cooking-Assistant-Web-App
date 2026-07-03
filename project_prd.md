````md
# 📦 မေမေ့လက်စွဲ (MayMay's Latt Swal / Cooking Assistant Web App PRD)

## Version: 1.0 (Chapter 3 Submission – Final Working System)
## Platform: Web Application (React + Vite)
## Architecture: MCP + Skill + Agent (Claude Code Integration)
## Language: Myanmar (Primary)

---

# 1. Executive Summary

**မေမေ့လက်စွဲ** is a lightweight, Claude Code-powered cooking assistant designed for Myanmar users.

It helps users solve a daily problem:

> “ဒီနေ့ ဘာချက်ရမလဲ?”

Instead of browsing long videos or searching recipe websites, the system provides **fast, structured, and reliable cooking suggestions** based on:

- Local recipe database (Myanmar foods)
- Ingredient-based matching
- Claude Agent decision logic
- Claude Skill formatting system
- MCP filesystem-based data retrieval

This project is built as a **fully working vertical-slice system**, fulfilling Chapter 3 requirements.

---

# 2. Problem Statement

Many users in Myanmar face difficulties in daily cooking decisions:

- Too many choices → decision fatigue
- No structured recipe guidance
- Heavy reliance on YouTube / social media
- No ingredient-based intelligent matching
- Time-consuming search process

### Core Problem:
Users do NOT need more recipes — they need **fast decision support**.

---

# 3. Project Objectives

## 3.1 Primary Objective
Enable users to decide what to cook within **under 1 minute**.

## 3.2 Secondary Objectives
- Demonstrate Claude Code integration (MCP + Skill + Agent)
- Provide structured Myanmar recipe dataset
- Implement simple ingredient-based matching logic
- Ensure clean and minimal UI experience
- Ensure fully working system flow (end-to-end)

---

# 4. Scope Definition (IMPORTANT FOR CH-3)

## ✅ In Scope (MVP)

- Meal suggestion (random selection from dataset)
- Ingredient-based recipe search
- Recipe detail view
- MCP filesystem integration (local data access)
- Claude Agent (decision routing)
- Claude Skill (output formatting)
- React frontend UI (simple, minimal)

---

## ❌ Out of Scope

- Voice recognition
- Image-based ingredient detection
- AI-generated recipes
- Nutrition calculation system
- External API scraping (Firecrawl or others)
- Multi-agent systems
- Cloud AI orchestration
- Recommendation ML models

---

# 5. System Architecture

## 5.1 High-Level Flow

```text
User
 ↓
React UI
 ↓
Claude Agent (meal-planner)
 ↓
MCP Filesystem (recipes.json)
 ↓
Skill (recipe formatting)
 ↓
Final Response Display
````

---

## 5.2 System Design Principle

This system follows:

> **Deterministic + Structured + Explainable AI Flow**

NOT:

* probabilistic AI generation
* external API dependency
* multi-source scraping

---

# 6. Core Features

---

## 6.1 Feature 1: Meal Suggestion

### User Action:

“ဒီနေ့ ဘာချက်ရမလဲ?”

### System Behavior:

* Agent selects random recipes from dataset
* MCP reads local recipe database
* Returns 3 meal options

### Output:

* Recipe name (Myanmar + English)
* Cooking time
* Ingredients preview

---

## 6.2 Feature 2: Ingredient-Based Search

### User Input:

Example:

> egg, onion, tomato

### System Behavior:

* MCP loads recipe dataset
* Agent applies matching logic:

  * ingredient overlap scoring
* Skill formats final output

### Output:

* Ranked recipe list based on match score

---

## 6.3 Feature 3: Recipe Detail View

Each recipe includes:

* Recipe name (MM + EN)
* Ingredients list
* Step-by-step instructions
* Cooking time
* Difficulty level (optional)

---

# 7. MCP Integration (Filesystem MCP)

## 7.1 Purpose

MCP is used to access **local structured recipe data**.

---

## 7.2 Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "./data"
      ]
    }
  }
}
```

---

## 7.3 Responsibilities

* Read `/data/recipes.json`
* Provide structured recipe data to Agent
* Ensure no external dependency is required
* Maintain deterministic data flow

---

# 8. Claude Skill Design

## 8.1 Skill Name:

`recipe-assistant`

---

## 8.2 Purpose

Responsible for **formatting recipe output** into user-friendly structure.

---

## 8.3 Responsibilities

* Convert raw JSON → readable recipe format
* Standardize ingredient display
* Format step-by-step instructions
* Ensure Myanmar-first output clarity

---

## 8.4 Rules

* ❌ Do NOT generate new recipes
* ❌ Do NOT modify data logic
* ✅ Only format and structure output

---

## 8.5 Output Format

```text
🍛 {Recipe Name MM / EN}

⏱ Cooking Time: XX min

🧂 Ingredients:
- item 1
- item 2

👨‍🍳 Steps:
1.
2.
3.
```

---

# 9. Claude Agent Design

## 9.1 Agent Name:

`meal-planner`

---

## 9.2 Purpose

Acts as the **central decision engine** of the system.

---

## 9.3 Responsibilities

### 1. Intent Detection

Classify user input:

* Meal suggestion request
* Ingredient-based request

---

### 2. Routing Logic

| Input Type            | Action             |
| --------------------- | ------------------ |
| “What should I cook?” | Random selection   |
| Ingredient input      | Matching algorithm |

---

### 3. MCP Interaction

* Load recipe dataset
* Retrieve structured data

---

### 4. Skill Invocation

* Pass result to `recipe-assistant`
* Ensure formatted output consistency

---

## 9.4 Rule

> Agent must NOT generate recipes — only decide and route data.

---

# 10. Data Model

## 10.1 Recipe Schema

```json
{
  "id": "fried_rice",
  "name_mm": "ထမင်းကြော်",
  "name_en": "Fried Rice",
  "ingredients": ["rice", "egg", "onion"],
  "steps": ["step1", "step2", "step3"],
  "time": "15 min",
  "difficulty": "easy"
}
```

---

## 10.2 Dataset Location

```
/data/recipes.json
```

---

## 10.3 Dataset Requirement

* Minimum: 10 recipes
* Recommended: 20–30 recipes
* Must be Myanmar-style home cooking

---

# 11. Frontend Design

## 11.1 Tech Stack

* React (Vite)
* Tailwind CSS

---

## 11.2 Pages

### Home Page

* 2 main buttons only:

  * 🍛 Meal suggestion
  * 🥬 Ingredient input

---

### Result Page

* Recipe list
* Recipe details view

---

## 11.3 UI Principles

* Minimal design
* Mobile-first
* Large touch buttons
* Fast response flow
* Myanmar-first readability

---

# 12. Non-Functional Requirements

* Fast response (<2 seconds perceived)
* Offline-capable dataset (no API dependency)
* Unicode Myanmar support
* Simple navigation
* Low cognitive load UI

---

# 13. Claude Code Integration Requirements

## 13.1 MCP Usage

* Must actively read recipe data

## 13.2 Skill Usage

* Must format all recipe outputs

## 13.3 Agent Usage

* Must control all user flow logic

---

# 14. Success Criteria (CH-3 PASS REQUIREMENTS)

Project is successful if:

### ✔ Technical

* MCP loads and retrieves data correctly
* Agent routes user input correctly
* Skill formats output correctly
* End-to-end flow works

### ✔ Structural

* `.mcp.json` exists and works
* `.claude/skills/recipe-assistant/SKILL.md` exists and used
* `.claude/agents/meal-planner.md` exists and used

### ✔ Functional

* User can get meal suggestion in under 1 minute
* Ingredient search returns results correctly
* System runs without external dependencies

---

# 15. Deliverables

## GitHub Repository Structure

```
📁 repo
 ├── data/
 │    └── recipes.json
 ├── src/
 │    └── React App
 ├── .mcp.json
 ├── .claude/
 │    ├── skills/
 │    │     └── recipe-assistant/SKILL.md
 │    ├── agents/
 │    │     └── meal-planner.md
 ├── report.md
 ├── slides/
 │    └── 6x20.md
```

---

# 16. Final Statement

**မေမေ့လက်စွဲ** is designed as a minimal, deterministic, and fully functional Claude Code system that demonstrates:

* real MCP usage
* real Skill usage
* real Agent workflow

It focuses on:

> correctness, simplicity, and traceable execution

rather than system complexity.

---
