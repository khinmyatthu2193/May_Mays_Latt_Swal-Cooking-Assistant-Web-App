import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChefHat, Clock3, Flame, ListChecks, Search, Shuffle, Utensils, X } from 'lucide-react';
import recipes from '../data/recipes.json';
import './styles.css';

const suggestionTriggers = [
  'ဘာချက်ရမလဲ',
  'what should i cook',
  'meal suggestion',
  'suggest',
  'random',
];

function normalize(value) {
  return value.toLowerCase().trim();
}

function tokenizeInput(value) {
  return value
    .split(/[,၊\n\s]+/)
    .map(normalize)
    .filter(Boolean);
}

function detectIntent(value) {
  const text = normalize(value);
  if (!text) return 'suggestion';
  return suggestionTriggers.some((trigger) => text.includes(trigger)) ? 'suggestion' : 'ingredients';
}

function shuffleRecipes(source) {
  return [...source].sort(() => Math.random() - 0.5);
}

function scoreRecipe(recipe, ingredients) {
  const terms = ingredients.map(normalize);
  const searchable = [
    ...recipe.ingredients_en,
    ...recipe.ingredients_mm,
    recipe.name_en,
    recipe.name_mm,
  ].map(normalize);

  const matched = terms.filter((term) =>
    searchable.some((item) => item.includes(term) || term.includes(item)),
  );

  return {
    ...recipe,
    matchScore: matched.length,
    matchedIngredients: [...new Set(matched)],
  };
}

function routeMealPlanner(inputValue) {
  const intent = detectIntent(inputValue);

  if (intent === 'suggestion') {
    return {
      title: 'ဒီနေ့အတွက် ဟင်းရွေးပေးထားပါတယ်',
      mode: 'suggestion',
      recipes: shuffleRecipes(recipes).slice(0, 3).map((recipe) => ({
        ...recipe,
        matchScore: null,
        matchedIngredients: [],
      })),
    };
  }

  const ingredients = tokenizeInput(inputValue);
  const ranked = recipes
    .map((recipe) => scoreRecipe(recipe, ingredients))
    .filter((recipe) => recipe.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || Number(a.time_minutes) - Number(b.time_minutes));

  return {
    title: ranked.length ? 'ပါဝင်ပစ္စည်းနဲ့ ကိုက်ညီတဲ့ ဟင်းများ' : 'ကိုက်ညီတဲ့ဟင်း မတွေ့သေးပါ',
    mode: 'ingredients',
    recipes: ranked.slice(0, 6),
    ingredients,
  };
}

function formatDifficulty(value) {
  const map = {
    easy: 'လွယ်',
    medium: 'အလယ်အလတ်',
  };
  return map[value] ?? value;
}

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
        <ChefHat size={40} aria-hidden="true" />
        <p>ဟင်းတစ်ခုရွေးပြီး အသေးစိတ်ကြည့်နိုင်ပါတယ်။</p>
      </section>
    );
  }

  return (
    <section className="detail" aria-live="polite">
      <div className="detail-heading">
        <div>
          <p className="eyebrow">MayMay's Recipe</p>
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
            {recipe.ingredients_mm.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>
            <ListChecks size={18} aria-hidden="true" />
            ချက်ပြုတ်နည်း
          </h3>
          <ol>
            {recipe.steps_mm.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function App() {
  const initial = useMemo(() => routeMealPlanner(''), []);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(initial);
  const [selectedRecipe, setSelectedRecipe] = useState(initial.recipes[0]);

  function runPlanner(nextQuery = query) {
    const nextResult = routeMealPlanner(nextQuery);
    setResult(nextResult);
    setSelectedRecipe(nextResult.recipes[0] ?? null);
  }

  function clearSearch() {
    setQuery('');
    const nextResult = routeMealPlanner('');
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
            <p className="eyebrow">ချက်ရတာ မြန်၊ ရွေးရတာ လွယ်</p>
            <h1>မေမေ့လက်စွဲ</h1>
            <p className="lead">Myanmar home cooking assistant</p>
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
        </div>
      </section>

      <section className="result-layout">
        <div className="list-panel">
          <div className="section-title">
            <h2>{result.title}</h2>
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
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
