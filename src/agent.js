export function mealPlannerAgent(intentPayload, recipes) {
  if (intentPayload.intent === 'suggest_meal') {
    const shuffled = [...recipes].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    return { type: 'suggestion', recipes: selected };
  }

  if (intentPayload.intent === 'search_ingredients') {
    const inputIngredients = new Set(intentPayload.ingredients.map((i) => i.toLowerCase()));

    const scored = recipes
      .map((recipe) => {
        const recipeIngredientTokens = recipe.ingredients.map((item) => item.toLowerCase());
        const matches = recipeIngredientTokens.filter((item) => inputIngredients.has(item));
        const score = matches.length;
        return { recipe, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.recipe.cooking_time - b.recipe.cooking_time)
      .map(({ recipe, score }) => ({ ...recipe, match_score: score }));

    if (scored.length === 0) {
      return { type: 'search', recipes: [] };
    }

    return { type: 'search', recipes: scored };
  }

  return { type: 'unknown', recipes: [] };
}
