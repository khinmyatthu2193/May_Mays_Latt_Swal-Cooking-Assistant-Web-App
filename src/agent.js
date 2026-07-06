const suggestionTriggers = [
  'ဘာချက်ရမလဲ',
  'ဟင်းရွေး',
  'အကြံပြု',
  'what should i cook',
  'meal suggestion',
  'suggest',
  'random',
];

export function normalize(value) {
  return String(value ?? '').toLowerCase().trim();
}

export function tokenizeIngredients(value) {
  return String(value ?? '')
    .split(/[,၊\n\s]+/)
    .map(normalize)
    .filter(Boolean);
}

export function detectIntent(inputValue) {
  const text = normalize(inputValue);
  if (!text) return 'suggestion';
  return suggestionTriggers.some((trigger) => text.includes(trigger)) ? 'suggestion' : 'ingredients';
}

function shuffleRecipes(source) {
  return [...source].sort(() => Math.random() - 0.5);
}

function scoreRecipe(recipe, ingredients) {
  const recipeIngredientsMm = recipe.ingredients_mm ?? recipe.ingredients ?? [];
  const recipeIngredientsEn = recipe.ingredients_en ?? [];
  const searchable = [
    recipe.name_mm,
    recipe.name_en,
    ...recipeIngredientsMm,
    ...recipeIngredientsEn,
  ].map(normalize);

  const matchedIngredients = ingredients.filter((term) =>
    searchable.some((item) => item.includes(term) || term.includes(item)),
  );

  return {
    ...recipe,
    matchScore: new Set(matchedIngredients).size,
    matchedIngredients: [...new Set(matchedIngredients)],
  };
}

export function mealPlannerAgent(inputValue, recipes) {
  const intent = detectIntent(inputValue);

  if (intent === 'suggestion') {
    return {
      intent,
      title: 'ဒီနေ့အတွက် ဟင်းရွေးပေးထားပါတယ်',
      recipes: shuffleRecipes(recipes).slice(0, 3).map((recipe) => ({
        ...recipe,
        matchScore: null,
        matchedIngredients: [],
      })),
    };
  }

  const ingredients = tokenizeIngredients(inputValue);
  const rankedRecipes = recipes
    .map((recipe) => scoreRecipe(recipe, ingredients))
    .filter((recipe) => recipe.matchScore > 0)
    .sort((a, b) => {
      const aMinutes = Number.isFinite(a.time_minutes) ? a.time_minutes : Number.MAX_SAFE_INTEGER;
      const bMinutes = Number.isFinite(b.time_minutes) ? b.time_minutes : Number.MAX_SAFE_INTEGER;
      return b.matchScore - a.matchScore || aMinutes - bMinutes;
    })
    .slice(0, 6);

  return {
    intent,
    title: rankedRecipes.length ? 'ပါဝင်ပစ္စည်းနဲ့ ကိုက်ညီတဲ့ ဟင်းများ' : 'ကိုက်ညီတဲ့ဟင်း မတွေ့သေးပါ',
    ingredients,
    recipes: rankedRecipes,
    emptyMessageMm: 'ဒီပစ္စည်းတွေနဲ့ ကိုက်ညီတဲ့ ဟင်းချက်နည်းကို လောလောဆယ် local recipe data ထဲမှာ မတွေ့သေးပါ။ နောက်ပိုင်းမှာ AI Assistant နဲ့ အကြံပြုပေးနိုင်အောင် ထည့်သွင်းပါမယ်။',
    emptyMessageEn: 'No matching recipe was found in the local recipe data yet. AI suggestion will be added later.',
  };
}

// Future placeholder: local search can call an AI fallback here after Gemini/Claude/OpenAI support is explicitly added.
export function futureAiFallbackPlaceholder() {
  return null;
}
