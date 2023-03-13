export function toTitleCase(text: string) {
  if (!text) return "";
  return text[0].toUpperCase() + text.slice(1);
}

export function splitIngredients(ingredients: string) {
  if (!ingredients) return [];
  return ingredients
    .split(",")
    .map((ingredient) => toTitleCase(ingredient.trim()));
}
