export function formatRecipesList(recipes) {
  if (!recipes || recipes.length === 0) {
    return 'တစ်ခုမှ မတွေ့ပါ။ အခြားပါဝင်ပစ္စည်းတွေကို ထပ်မံ ထည့်ကြည့်ပါ။';
  }

  const lines = recipes.map((recipe, index) => {
    const scoreLine = recipe.match_score != null ? ` (ပြိုင်ဆိုင်မှု: ${recipe.match_score})` : '';
    return `🍛 ${index + 1}. ${recipe.name_mm} / ${recipe.name_en}${scoreLine}\n⏱ Cooking Time: ${recipe.cooking_time} min\n🧂 Ingredients: ${recipe.ingredients.join(', ')}\n`;
  });

  return lines.join('\n');
}

export function formatRecipeDetail(recipe) {
  if (!recipe) {
    return '';
  }

  const ingredients = recipe.ingredients.map((item) => `- ${item}`).join('\n');
  const steps = recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');

  return `🍛 ${recipe.name_mm} / ${recipe.name_en}\n\n⏱ Cooking Time: ${recipe.cooking_time} min\n🧂 Ingredients:\n${ingredients}\n\n👨‍🍳 Steps:\n${steps}`;
}
