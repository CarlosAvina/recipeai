import React, { SyntheticEvent } from "react";
import Head from "next/head";

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

type Choice = {
  text: string;
  index: number;
  logprobs: null;
  finish_reason: string;
};

type Response = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<Choice>;
  usage: Usage;
};

function splitIngredients(ingredients: string) {
  if (!ingredients) return [];
  return ingredients.trim().replace(" ", "").split(",");
}

export default function Home() {
  const [recipes, setRecipes] = React.useState<Array<Choice>>([]);
  const [ingredients, setIngredients] = React.useState<Array<string>>([]);
  const [loading, setLoading] = React.useState(false);

  async function generateRecipe(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const cuisineSelect = e.currentTarget.elements.namedItem(
      "cuisine"
    ) as HTMLSelectElement;
    const foodTypeSelect = e.currentTarget.elements.namedItem(
      "foodType"
    ) as HTMLSelectElement;
    const ingredientsInput = e.currentTarget.elements.namedItem(
      "ingredients"
    ) as HTMLTextAreaElement;

    let ingredientsText = "";
    const ingredientsList = splitIngredients(ingredientsInput.value);

    ingredientsList.forEach(
      (ingredient) => (ingredientsText += "- " + ingredient + "\n")
    );

    const ingredientsPrompt =
      " with the folliwing ingredients: \n" + ingredientsText;
    const prompt = `Give me a ${foodTypeSelect.value} ${
      cuisineSelect.value
    } cooking recipe${ingredientsText ? ingredientsPrompt : ""}`;

    console.log({ prompt });

    const response = await fetch("/api/generate", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    const json: Response = await response.json();
    setRecipes(json.choices);
    setLoading(false);
  }

  function onIngredientsChange(e: SyntheticEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    const ingredientsList = splitIngredients(value);
    setIngredients(ingredientsList);
  }

  return (
    <>
      <Head>
        <title>Recipe AI</title>
        <meta
          name="description"
          content="A site powered by ChatGPT for generating cooking recipes"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <form
          onSubmit={(e) => {
            setLoading(true);
            generateRecipe(e);
          }}
        >
          <h1>Generate a cooking recipe with AI!</h1>

          <label>
            Cuisine:
            <select name="cuisine">
              <option value="mexican">Mexican</option>
              <option value="italian">Italian</option>
              <option value="japanese">Japanese</option>
              <option value="indian">Indian</option>
              <option value="korean">Korean</option>
              <option value="thai">Thai</option>
            </select>
          </label>

          <label>
            Type:
            <select name="foodType">
              <option value="regular">Regular</option>
              <option value="light">Light</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </label>

          <label>
            Ingredients (optional):
            <textarea
              name="ingredients"
              placeholder="ingredients"
              onChange={onIngredientsChange}
            />
          </label>
          <ul>
            {ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>

          <button type="submit">generate</button>
        </form>
        {loading ? <p>Loading...</p> : null}
        {recipes.map((item) => (
          <div key={item.index}>
            {item.text.split("\n").map((str) => (
              <p key={str}>{str}</p>
            ))}
          </div>
        ))}
      </main>
    </>
  );
}
