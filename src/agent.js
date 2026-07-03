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
  const searchable = [
    recipe.name_mm,
    recipe.name_en,
    ...recipe.ingredients_mm,
    ...recipe.ingredients_en,
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
    .sort((a, b) => b.matchScore - a.matchScore || a.time_minutes - b.time_minutes)
    .slice(0, 6);

  return {
    intent,
    title: rankedRecipes.length ? 'ပါဝင်ပစ္စည်းနဲ့ ကိုက်ညီတဲ့ ဟင်းများ' : 'ကိုက်ညီတဲ့ဟင်း မတွေ့သေးပါ',
    ingredients,
    recipes: rankedRecipes,
  };
}
