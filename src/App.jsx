import { useMemo, useState } from 'react';
import { mealPlannerAgent } from './agent.js';
import { formatRecipesList, formatRecipeDetail } from './skill.js';
import recipes from './data/recipes.json';

const initialMessage = 'မင်္ဂလာပါ! မနေ့က ဘာချက်မလဲဆိုတာရှာစရာမလိုပါဘူး။ အသင့်ရှိတဲ့ပါဝင်ပစ္စည်းတွေထည့်ပြီး စိုက်လုပ်ကြပါစို့။';

function App() {
  const [userInput, setUserInput] = useState('');
  const [responseText, setResponseText] = useState(initialMessage);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const recipeNames = useMemo(() => recipes.map((r) => r.name_mm), []);

  const handleSuggestMeals = async () => {
    setLoading(true);
    const result = mealPlannerAgent({ intent: 'suggest_meal' }, recipes);
    const formatted = formatRecipesList(result.recipes);
    setSelectedRecipe(null);
    setSearchResults(result.recipes);
    setResponseText(formatted);
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const normalized = userInput
      .split(/[ ,]+/)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    const result = mealPlannerAgent({ intent: 'search_ingredients', ingredients: normalized }, recipes);
    const formatted = formatRecipesList(result.recipes);
    setSelectedRecipe(null);
    setSearchResults(result.recipes);
    setResponseText(formatted);
    setLoading(false);
  };

  const selectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setResponseText(formatRecipeDetail(recipe));
  };

  return (
    <div className="app-shell">
      <header>
        <div>
          <p className="eyebrow">မေမေ့လက်စွဲ</p>
          <h1>ဒီနေ့ ဘာချက်မလဲ?</h1>
        </div>
      </header>

      <main>
        <section className="controls-card">
          <div className="control-row">
            <button onClick={handleSuggestMeals} disabled={loading}>
              ငါ့အတွက် ငါးချက်နည်းရွေးပါ
            </button>
            <input
              type="text"
              placeholder="ဥပမာ - egg, onion, tomato"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button onClick={handleSearch} disabled={loading || !userInput.trim()}>
              ပါဝင်ပစ္စည်းနောက်ကြည့်ပါ
            </button>
          </div>
        </section>

        <section className="response-card">
          <div className="response-header">
            <strong>အဖြေ</strong>
            {loading && <span className="loading">Loading…</span>}
          </div>
          <pre>{responseText}</pre>
        </section>

        {searchResults.length > 0 && !selectedRecipe && (
          <section className="recipe-list-card">
            <h2>Recipe Options</h2>
            <ul>
              {searchResults.map((recipe) => (
                <li key={recipe.id}>
                  <button onClick={() => selectRecipe(recipe)}>
                    {recipe.name_mm} — {recipe.name_en}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
