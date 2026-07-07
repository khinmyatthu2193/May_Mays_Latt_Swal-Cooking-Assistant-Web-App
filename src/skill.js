export function formatDifficulty(value) {
  const labels = {
    easy: 'လွယ်',
    medium: 'အလယ်အလတ်',
    hard: 'ခက်',
  };

  return labels[value] ?? value;
}

export function formatRecipeSummary(recipe) {
  return `${recipe.name_mm} / ${recipe.name_en} - ${recipe.time}`;
}

export function formatRecipeDetail(recipe) {
  if (!recipe) return '';

  const ingredients = recipe.ingredients_mm.map((item) => `- ${item}`).join('\n');
  const steps = recipe.steps_mm.map((step, index) => `${index + 1}. ${step}`).join('\n');

  return `🍛 ${recipe.name_mm} / ${recipe.name_en}

⏱ Cooking Time: ${recipe.time}
Difficulty: ${formatDifficulty(recipe.difficulty)}

🧂 Ingredients:
${ingredients}

👨‍🍳 Steps:
${steps}`;
}
