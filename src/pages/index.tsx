import React, { SyntheticEvent } from "react";
import Head from "next/head";
import Link from "next/link";

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
    <div className="grid grid-cols-8 grid-rows-[min-content_1fr_min-content] gap-4 h-screen">
      <Head>
        <title>Recipe AI</title>
        <meta
          name="description"
          content="A site powered by ChatGPT for generating cooking recipes"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍽️</text></svg>"
        />
      </Head>
      <nav className="flex flex-col gap-6 col-start-2 col-end-8 p-3">
        <h1 className="text-4xl font-extrabold cursor-pointer">🍽️ Recipe.AI</h1>
        <hr />
      </nav>
      <main className="col-start-3 col-end-7">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            setLoading(true);
            generateRecipe(e);
          }}
        >
          <h1 className="text-4xl font-extrabold text-center">
            Generate a cooking recipe with AI!
          </h1>

          <label className="flex flex-col font-semibold">
            Select a cuisine type
            <select
              name="cuisine"
              className="border-black border-2 rounded-md text-lg p-2"
            >
              <option value="mexican">Mexican</option>
              <option value="italian">Italian</option>
              <option value="japanese">Japanese</option>
              <option value="indian">Indian</option>
              <option value="korean">Korean</option>
              <option value="thai">Thai</option>
            </select>
          </label>

          <label className="flex flex-col font-semibold">
            Select a food type
            <select
              name="foodType"
              className="border-black border-2 rounded-md text-lg p-2"
            >
              <option value="regular">Regular</option>
              <option value="light">Light</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </label>

          <label className="flex flex-col font-semibold">
            Write a list of ingredients for the recipe (optional)
            <textarea
              className="border-black border-2 rounded-md text-lg p-2"
              name="ingredients"
              placeholder="Comma separated e.g. (tomato, milk, flour)"
              onChange={onIngredientsChange}
            />
          </label>
          <ul className="list-disc font-semibold">
            {ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>

          <button
            className="bg-black text-white rounded-md text-lg p-2 font-semibold"
            type="submit"
          >
            {loading ? "Cooking..." : "Generate recipe"}
          </button>
        </form>
        {!loading
          ? recipes.map((item) => (
              <div
                className="font-semibold rounded-md border-1 border-black my-4 bg-slate-100 p-4"
                key={item.index}
              >
                {item.text.split("\n").map((str) => (
                  <p key={str}>{str}</p>
                ))}
              </div>
            ))
          : null}
      </main>
      <footer className="flex flex-col col-start-2 col-end-8">
        <hr />
        <div className="p-6">
          Powered by ChatGPT and Vercel Edge Functions. Inspired by{" "}
          <Link
            className="font-bold hover:text-blue-400"
            href="https://www.twitterbio.com/"
          >
            twitterBio.com
          </Link>
        </div>
      </footer>
    </div>
  );
}
