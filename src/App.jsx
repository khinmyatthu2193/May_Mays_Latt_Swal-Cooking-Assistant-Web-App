import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChefHat,
  Flame,
  ListChecks,
  Search,
  Shuffle,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import logoUrl from '../logo.png';
import recipes from '../data/recipes.json';
import { mealPlannerAgent } from './agent.js';
import { formatDifficulty } from './skill.js';

const recipeIconMap = {
  egg_tomato_curry: '🍳',
  fried_rice: '🍚',
  roselle_soup: '🥣',
  chicken_potato_curry: '🍛',
  fish_sour_curry: '🐟',
  pennywort_salad: '🥗',
  water_spinach_stir_fry: '🥬',
  lentil_soup: '🍲',
  tea_leaf_salad: '🍃',
  tofu_nway: '🥘',
  pork_mustard_curry: '🍖',
  okra_fish_paste_dip: '🌶️',
  chicken_basil_stir_fry: '🌿',
  prawn_tamarind_curry: '🦐',
  pumpkin_curry: '🎃',
  cabbage_stir_fry: '🥬',
  eggplant_garlic_curry: '🍆',
  beef_potato_curry: '🥩',
  fish_paste_fried_rice: '🍚',
  chicken_noodle_soup: '🍜',
  tomato_fish_paste_dip: '🍅',
  gourd_soup: '🥒',
  mushroom_garlic_stir_fry: '🍄',
  chickpea_salad: '🫘',
  pork_bamboo_shoot_curry: '🎋',
  sweet_corn_soup: '🌽',
  spinach_egg_stir_fry: '🥬',
  catfish_curry: '🐟',
  banana_bud_salad: '🍌',
  chicken_coconut_noodle: '🍜',
};

const difficultyTone = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

const decisionSteps = [
  'စဉ်းစားနေပါတယ်...',
  'ပါဝင်ပစ္စည်းတွေ စစ်နေပါတယ်...',
  'ကိုက်ညီတဲ့ဟင်းတွေ ရှာနေပါတယ်...',
  'ဟင်းလျာတွေ ရှာတွေ့ပါပြီ',
];

const TIME_FILTERS = [
  { key: 'all', label: 'အကုန်', icon: '🍽️' },
  { key: 'quick', label: 'အမြန် (၂၀ မိနစ်အတွင်း)', icon: '⚡' },
  { key: 'medium', label: 'အလယ် (၂၀-၄၀ မိနစ်)', icon: '🕐' },
  { key: 'slow', label: 'ရှည် (၄၀ မိနစ်အထက်)', icon: '🐢' },
];

const THINKING_DURATION_MS = 5000;

function getRecipeIcon(recipe) {
  return recipeIconMap[recipe.id] ?? '🍽️';
}

function getDifficultyTone(recipe) {
  return difficultyTone[recipe.difficulty] ?? 'medium';
}

function RecipeCard({ recipe, active, onSelect }) {
  const tone = getDifficultyTone(recipe);
  const recipeTime = recipe.time ?? 'အချိန်မဖော်ပြထားပါ';

  return (
    <button className={`recipe-card ${active ? 'active' : ''}`} onClick={() => onSelect(recipe)}>
      <span className="recipe-card-top">
        <span className="recipe-icon" aria-hidden="true">{getRecipeIcon(recipe)}</span>
        <span className="recipe-title-group">
          <span className="recipe-card-title">{recipe.name_mm}</span>
        </span>
      </span>

      <span className="recipe-card-meta">
        <span className="time-badge compact">
          <span aria-hidden="true">⏱</span>
          {recipeTime}
        </span>
        <span className={`difficulty-badge ${tone}`}>
          <Flame size={14} aria-hidden="true" />
          {formatDifficulty(recipe.difficulty)}
        </span>
      </span>
    </button>
  );
}

function RecipeDetail({ recipe, onBack }) {
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

  const tone = getDifficultyTone(recipe);
  const recipeIngredients = recipe.ingredients_mm ?? recipe.ingredients ?? [];
  const recipeSteps = recipe.steps_mm ?? recipe.steps ?? [];
  const recipeTime = recipe.time ?? 'အချိန်မဖော်ပြထားပါ';
  return (
    <section className="detail" aria-live="polite">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" />
        ဟင်းလျာစာရင်းသို့ ပြန်သွားမယ်
      </button>

      <div className="detail-heading">
        <div className="detail-title-row">
          <span className="detail-recipe-icon" aria-hidden="true">{getRecipeIcon(recipe)}</span>
          <div>
            <p className="detail-eyebrow">ရွေးထားသောဟင်းလျာ</p>
            <h2>{recipe.name_mm}</h2>
          </div>
        </div>
        <div className="detail-badge-stack">
          <div className="time-badge">
            <span aria-hidden="true">⏱</span>
            {recipeTime}
          </div>
          <div className={`difficulty-badge ${tone}`}>
            <Flame size={14} aria-hidden="true" />
            {formatDifficulty(recipe.difficulty)}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-section">
          <h3>
            <Utensils size={16} aria-hidden="true" />
            ပါဝင်ပစ္စည်းများ
          </h3>
          <div className="ingredient-list">
            {recipeIngredients.map((item) => (
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
            {recipeSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const emptyResult = useMemo(() => ({ intent: 'idle', title: '', recipes: [] }), []);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(emptyResult);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [decisionIndex, setDecisionIndex] = useState(0);
  const [timeFilter, setTimeFilter] = useState('all');
  const hasResults = result.recipes.length > 0;

  const filteredRecipes = useMemo(() => {
    if (timeFilter === 'all') return result.recipes;
    return result.recipes.filter((recipe) => {
      const mins = recipe.time_minutes ?? 0;
      if (timeFilter === 'quick') return mins > 0 && mins <= 20;
      if (timeFilter === 'medium') return mins > 20 && mins <= 40;
      if (timeFilter === 'slow') return mins > 40;
      return true;
    });
  }, [result.recipes, timeFilter]);

  function runPlanner(inputValue = query) {
    setSelectedRecipe(null);
    setIsThinking(true);
    setDecisionIndex(0);

    const stepDelay = THINKING_DURATION_MS / decisionSteps.length;

    decisionSteps.forEach((_, index) => {
      window.setTimeout(() => setDecisionIndex(index), index * stepDelay);
    });

    window.setTimeout(() => {
      const nextResult = mealPlannerAgent(inputValue, recipes);
      setResult(nextResult);
      setIsThinking(false);
      setDecisionIndex(decisionSteps.length - 1);
    }, THINKING_DURATION_MS);
  }

  function clearSearch() {
    setQuery('');
    setResult(emptyResult);
    setSelectedRecipe(null);
    setIsThinking(false);
    setDecisionIndex(0);
  }

  function startIngredientMode() {
    setShowSearch(true);
    setResult(emptyResult);
    setSelectedRecipe(null);
  }

  function handleTimeFilter(key) {
    setTimeFilter(key);
    setSelectedRecipe(null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-icon-wrap" aria-hidden="true">
          <img src={logoUrl} alt="" />
        </div>
        <h1 className="sr-only">မေမေ့လက်စွဲ</h1>
      </header>

      {selectedRecipe ? (
        <div className="detail-screen mobile-detail-screen">
          <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
        </div>
      ) : null}

      <div className={`home-screen ${selectedRecipe ? 'has-selected' : ''}`}>
      <section className="action-area" aria-label="ဟင်းရွေးရန်">
        <div className="cta-row">
          <button className="btn-suggest" onClick={() => runPlanner('')} disabled={isThinking}>
            <Shuffle size={20} aria-hidden="true" />
            ဒီနေ့ ဘာချက်ရမလဲ
          </button>
          <button className="btn-secondary-cta" onClick={startIngredientMode} disabled={isThinking}>
            <Utensils size={20} aria-hidden="true" />
            ပစ္စည်းနဲ့ချက်မယ်
          </button>
        </div>

        {showSearch ? (
          <form
            className="search-form secondary"
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
              placeholder="ဥပမာ - ကြက်ဥ, ခရမ်းချဉ်သီး"
              aria-label="ပါဝင်ပစ္စည်း ရိုက်ထည့်ရန်"
            />
            {query ? (
              <button type="button" className="btn-clear" onClick={clearSearch} aria-label="ရှာဖွေမှု ဖျက်ရန်">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
            <button type="submit" className="btn-search" disabled={isThinking}>
              <Search size={16} aria-hidden="true" />
              ရှာမယ်
            </button>
          </form>
        ) : null}
      </section>

      {isThinking ? (
        <section className="decision-panel" aria-live="polite">
          {decisionSteps.map((step, index) => (
            <div key={step} className={`decision-step ${index <= decisionIndex ? 'active' : ''}`}>
              <span className="decision-dot" aria-hidden="true" />
              {step}
            </div>
          ))}
        </section>
      ) : null}

      <div className={`result-layout ${hasResults ? '' : 'idle'} ${selectedRecipe ? 'has-detail' : 'no-detail'}`}>
        <div className="list-panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">ဟင်းလျာအကြံပြုချက်</p>
              <h2>{hasResults ? result.title : 'အပေါ်က ခလုတ်တစ်ခုကို နှိပ်ပြီး စတင်ပါ'}</h2>
            </div>
            <span className="recipe-count">{filteredRecipes.length}</span>
          </div>

          {hasResults ? (
            <>
              <div className="time-filter-bar">
                {TIME_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`time-filter-chip ${timeFilter === f.key ? 'active' : ''}`}
                    onClick={() => handleTimeFilter(f.key)}
                    type="button"
                  >
                    <span aria-hidden="true">{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="recipe-list">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      active={selectedRecipe?.id === recipe.id}
                      onSelect={setSelectedRecipe}
                    />
                  ))
                ) : (
                  <div className="no-result">
                    <p>ဒီအချိန်ပိတ်နဲ့ ကိုက်ညီတဲ့ဟင်း မတွေ့ပါ။</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-result idle-state">
              <Sparkles size={34} aria-hidden="true" />
              <p>{result.intent === 'ingredients' ? result.emptyMessageMm : 'ဒီနေ့စားချင်တာကို အမြန်ဆုံး ဆုံးဖြတ်ပေးဖို့ အသင့်ပါ။'}</p>
              {result.intent === 'ingredients' ? <p className="empty-message-en">{result.emptyMessageEn}</p> : null}
            </div>
          )}
        </div>

        {selectedRecipe ? (
          <div className="desktop-detail-panel">
            <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
          </div>
        ) : null}
      </div>
      </div>

      <footer className="app-footer">
        <span>မေမေ့လက်စွဲ</span>
        <span className="footer-badge">Powered by MCP + Agent + Skill</span>
      </footer>
    </main>
  );
}
