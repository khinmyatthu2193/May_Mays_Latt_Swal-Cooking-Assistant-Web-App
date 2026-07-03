import { useMemo, useState } from 'react';
import {
  ChefHat,
  Clock3,
  Flame,
  ListChecks,
  Search,
  Shuffle,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import recipes from '../data/recipes.json';
import { mealPlannerAgent } from './agent.js';
import { formatDifficulty, formatRecipeDetail, formatRecipeSummary } from './skill.js';

function RecipeCard({ recipe, active, onSelect }) {
  return (
    <button className={`recipe-card ${active ? 'active' : ''}`} onClick={() => onSelect(recipe)}>
      <span className="recipe-title">{recipe.name_mm}</span>
      <span className="recipe-subtitle">{recipe.name_en}</span>
      <span className="recipe-meta">
        <Clock3 size={16} aria-hidden="true" />
        {recipe.time}
        <Flame size={16} aria-hidden="true" />
        {formatDifficulty(recipe.difficulty)}
      </span>
      {recipe.matchScore ? (
        <span className="match-pill">{recipe.matchScore} ခု ကိုက်ညီ</span>
      ) : (
        <span className="ingredient-preview">{recipe.ingredients_mm.slice(0, 3).join('၊ ')}</span>
      )}
    </button>
  );
}

function RecipeDetail({ recipe }) {
  if (!recipe) {
    return (
      <section className="detail empty">
        <ChefHat size={42} aria-hidden="true" />
        <p>ဟင်းတစ်ခုရွေးပြီး အသေးစိတ်ကြည့်နိုင်ပါတယ်။</p>
      </section>
    );
  }

  return (
    <section className="detail" aria-live="polite">
      <div className="detail-heading">
        <div>
          <p className="eyebrow">recipe-assistant output</p>
          <h2>{recipe.name_mm}</h2>
          <p>{recipe.name_en}</p>
        </div>
        <div className="time-badge">
          <Clock3 size={18} aria-hidden="true" />
          {recipe.time}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <h3>
            <Utensils size={18} aria-hidden="true" />
            ပါဝင်ပစ္စည်းများ
          </h3>
          <ul>
            {recipe.ingredients_mm.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>
            <ListChecks size={18} aria-hidden="true" />
            ချက်ပြုတ်နည်း
          </h3>
          <ol>
            {recipe.steps_mm.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <pre className="formatted-output">{formatRecipeDetail(recipe)}</pre>
    </section>
  );
}

export default function App() {
  const initialResult = useMemo(() => mealPlannerAgent('', recipes), []);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(initialResult);
  const [selectedRecipe, setSelectedRecipe] = useState(initialResult.recipes[0]);

  function runPlanner(inputValue = query) {
    const nextResult = mealPlannerAgent(inputValue, recipes);
    setResult(nextResult);
    setSelectedRecipe(nextResult.recipes[0] ?? null);
  }

  function clearSearch() {
    setQuery('');
    const nextResult = mealPlannerAgent('', recipes);
    setResult(nextResult);
    setSelectedRecipe(nextResult.recipes[0]);
  }

  return (
    <main className="app-shell">
      <section className="top-panel">
        <div className="brand-block">
          <div className="brand-icon" aria-hidden="true">
            <ChefHat size={30} />
          </div>
          <div>
            <p className="eyebrow">MCP + Skill + Agent</p>
            <h1>မေမေ့လက်စွဲ</h1>
            <p className="lead">နေ့တိုင်း “ဘာချက်ရမလဲ” ဆိုတဲ့ဆုံးဖြတ်ချက်ကို တစ်မိနစ်အတွင်း လွယ်ကူအောင် ကူညီပေးတဲ့ Myanmar cooking assistant။</p>
          </div>
        </div>

        <div className="action-grid" aria-label="Main actions">
          <button className="primary-action" onClick={() => runPlanner('')}>
            <Shuffle size={22} aria-hidden="true" />
            ဒီနေ့ ဘာချက်ရမလဲ?
          </button>

          <form
            className="search-box"
            onSubmit={(event) => {
              event.preventDefault();
              runPlanner();
            }}
          >
            <Search size={20} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="egg, onion, tomato"
              aria-label="Ingredient input"
            />
            {query ? (
              <button type="button" className="icon-button" onClick={clearSearch} aria-label="Clear">
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}
            <button type="submit">ရှာမယ်</button>
          </form>

          <div className="flow-strip" aria-label="System flow">
            <span>React UI</span>
            <span>MCP data</span>
            <span>meal-planner</span>
            <span>recipe-assistant</span>
          </div>
        </div>
      </section>

      <section className="status-band" aria-label="Project status">
        <div>
          <Sparkles size={18} aria-hidden="true" />
          <strong>{recipes.length}</strong>
          <span>local recipes</span>
        </div>
        <div>
          <Clock3 size={18} aria-hidden="true" />
          <strong>&lt; 2s</strong>
          <span>offline response</span>
        </div>
        <div>
          <ListChecks size={18} aria-hidden="true" />
          <strong>{result.recipes.length}</strong>
          <span>current matches</span>
        </div>
      </section>

      <section className="result-layout">
        <div className="list-panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">meal-planner result</p>
              <h2>{result.title}</h2>
            </div>
            <span>{result.recipes.length} recipes</span>
          </div>

          {result.recipes.length ? (
            <div className="recipe-list">
              {result.recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  active={selectedRecipe?.id === recipe.id}
                  onSelect={setSelectedRecipe}
                />
              ))}
            </div>
          ) : (
            <div className="no-result">
              <p>ဥပမာ `ကြက်ဥ, ကြက်သွန်, ခရမ်းချဉ်သီး` လို ထပ်ရှာကြည့်ပါ။</p>
            </div>
          )}
        </div>

        <RecipeDetail recipe={selectedRecipe} />
      </section>

      <footer className="app-footer">
        <span>{selectedRecipe ? formatRecipeSummary(selectedRecipe) : 'No recipe selected'}</span>
      </footer>
    </main>
  );
}
