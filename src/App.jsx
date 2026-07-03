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
  Database,
  Zap,
  FileText,
  SearchX,
} from 'lucide-react';
import logoUrl from '../logo.png';
import recipes from '../data/recipes.json';
import { mealPlannerAgent } from './agent.js';
import { formatDifficulty, formatRecipeDetail, formatRecipeSummary } from './skill.js';

function RecipeCard({ recipe, active, onSelect }) {
  return (
    <button className={`recipe-card ${active ? 'active' : ''}`} onClick={() => onSelect(recipe)}>
      <span className="recipe-card-title">{recipe.name_mm}</span>
      <span className="recipe-card-sub">{recipe.name_en}</span>
      <span className="recipe-card-meta">
        <span className="meta-item">
          <Clock3 size={14} aria-hidden="true" />
          {recipe.time}
        </span>
        <span className="meta-item">
          <Flame size={14} aria-hidden="true" />
          {formatDifficulty(recipe.difficulty)}
        </span>
      </span>
      {recipe.matchScore ? (
        <span className="match-pill">
          <Sparkles size={14} aria-hidden="true" />
          {recipe.matchScore} ခု ကိုက်ညီ
        </span>
      ) : (
        <span className="ingredients-preview">{recipe.ingredients_mm.slice(0, 3).join('၊ ')}</span>
      )}
    </button>
  );
}

function RecipeDetail({ recipe }) {
  if (!recipe) {
    return (
      <section className="detail empty">
        <span className="empty-icon">
          <ChefHat size={32} aria-hidden="true" />
        </span>
        <p>ဟင်းတစ်ခုရွေးပြီး အသေးစိတ်ကြည့်နိုင်ပါတယ်</p>
      </section>
    );
  }

  return (
    <section className="detail" aria-live="polite">
      <div className="detail-heading">
        <div>
          <p className="detail-eyebrow">recipe-assistant output</p>
          <h2>{recipe.name_mm}</h2>
          <p className="detail-name-en">{recipe.name_en}</p>
        </div>
        <div className="time-badge">
          <Clock3 size={16} aria-hidden="true" />
          {recipe.time}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-section">
          <h3>
            <Utensils size={16} aria-hidden="true" />
            ပါဝင်ပစ္စည်းများ
          </h3>
          <div className="ingredient-list">
            {recipe.ingredients_mm.map((item) => (
              <span key={item} className="ingredient-chip">{item}</span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h3>
            <ListChecks size={16} aria-hidden="true" />
            ချက်ပြုတ်နည်း
          </h3>
          <ol className="steps-list">
            {recipe.steps_mm.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="formatted-output">
        <p className="fo-label">Skill formatted output</p>
        {formatRecipeDetail(recipe)}
      </div>
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
      {/* ---- Header ---- */}
      <header className="app-header">
        <div className="brand-icon-wrap" aria-hidden="true">
          <img src={logoUrl} alt="" />
        </div>
        <div className="brand-text">
          <h1 className="sr-only">မေမေ့လက်စွဲ</h1>
          <p className="brand-sub">နေ့တိုင်း ဟင်းရွေးရတာ ပိုလွယ်စေမယ့် Myanmar cooking assistant</p>
        </div>
      </header>

      {/* ---- Actions ---- */}
      <div className="action-area">
        <div className="action-row">
          <button className="btn-suggest" onClick={() => runPlanner('')}>
            <Shuffle size={20} aria-hidden="true" />
            ဒီနေ့ ဘာချက်ရမလဲ?
          </button>

          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault();
              runPlanner();
            }}
          >
            <span className="search-icon">
              <Search size={18} aria-hidden="true" />
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ပါဝင်ပစ္စည်းများ ရိုက်ထည့်ပါ... (ဥပမာ - ကြက်ဥ, ကြက်သွန်)"
              aria-label="Ingredient input"
            />
            {query ? (
              <button type="button" className="btn-clear" onClick={clearSearch} aria-label="Clear search">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
            <button type="submit" className="btn-search">
              <Search size={16} aria-hidden="true" />
              ရှာမယ်
            </button>
          </form>
        </div>
      </div>

      {/* ---- Status Bar ---- */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-icon green">
            <Database size={18} aria-hidden="true" />
          </span>
          <div>
            <div className="status-value">{recipes.length}</div>
            <div className="status-label">ချက်ပြုတ်နည်းများ</div>
          </div>
        </div>
        <div className="status-item">
          <span className="status-icon amber">
            <Zap size={18} aria-hidden="true" />
          </span>
          <div>
            <div className="status-value">{'< 2s'}</div>
            <div className="status-label">တုံ့ပြန်ချိန်</div>
          </div>
        </div>
        <div className="status-item">
          <span className="status-icon orange">
            <FileText size={18} aria-hidden="true" />
          </span>
          <div>
            <div className="status-value">{result.recipes.length}</div>
            <div className="status-label">တွေ့ရှိသည့်ဟင်းလျာများ</div>
          </div>
        </div>
      </div>

      {/* ---- Results Layout ---- */}
      <div className="result-layout">
        <div className="list-panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">meal-planner result</p>
              <h2>{result.title}</h2>
            </div>
            <span className="recipe-count">{result.recipes.length}</span>
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
              <SearchX size={36} aria-hidden="true" />
              <p>ဥပမာ `ကြက်ဥ, ကြက်သွန်, ခရမ်းချဉ်သီး` လို ပါဝင်ပစ္စည်းများ ရိုက်ထည့်ပြီး ပြန်ရှာကြည့်ပါ။</p>
            </div>
          )}
        </div>

        <RecipeDetail recipe={selectedRecipe} />
      </div>

      {/* ---- Footer ---- */}
      <footer className="app-footer">
        {selectedRecipe ? formatRecipeSummary(selectedRecipe) : 'No recipe selected'}
      </footer>
    </main>
  );
}
