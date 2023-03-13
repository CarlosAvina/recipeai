import React, { SyntheticEvent } from "react";
import Head from "next/head";

import { Link, Select } from "@/components";
import { splitIngredients } from "@/utils/format";
import { CLIPBOARD_TIMEOUT } from "@/utils/constants";

export default function Home() {
  const [recipe, setRecipe] = React.useState<string>("");
  const [ingredients, setIngredients] = React.useState<Array<string>>([]);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const scrollCheckpointRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, CLIPBOARD_TIMEOUT);

      return () => clearInterval(timeout);
    }
  }, [copied]);

  async function generateRecipe(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setRecipe("");

    const formElements = e.currentTarget.elements;

    const cuisineSelect: HTMLSelectElement = formElements.namedItem(
      "cuisine"
    ) as HTMLSelectElement;
    const mealTypeSelect = formElements.namedItem(
      "mealType"
    ) as HTMLSelectElement;
    const ingredientsInput = formElements.namedItem(
      "ingredients"
    ) as HTMLTextAreaElement;

    let ingredientsText = "";
    const ingredientsList = splitIngredients(ingredientsInput.value);

    ingredientsList.forEach(
      (ingredient) => (ingredientsText += "- " + ingredient + "\n")
    );

    const ingredientsPrompt =
      " with the following ingredients: \n" + ingredientsText;
    const prompt = `Give me a ${mealTypeSelect.value} ${
      cuisineSelect.value
    } cooking recipe${ingredientsText ? ingredientsPrompt : ""}`;

    const response = await fetch("/api/generate", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      setLoading(false);
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setRecipe((prev) => (prev += chunkValue));
    }

    setLoading(false);
    scrollCheckpointRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function onIngredientsChange(e: SyntheticEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    const ingredientsList = splitIngredients(value);
    setIngredients(ingredientsList);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(recipe);
    setCopied(true);
  }

  return (
    <div className="grid grid-cols-8 grid-rows-[min-content_1fr_min-content] gap-4 h-screen">
      <Head>
        <title>Food Recipes AI</title>
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
        <h1 className="text-2xl md:text-4xl font-extrabold cursor-pointer pt-4 text-center md:text-left whitespace-nowrap">
          🍽️ FoodRecipes.AI
        </h1>
        <hr />
      </nav>
      <main className="flex flex-col col-start-2 col-end-8 md:col-start-3 md:col-end-7">
        <form className="flex flex-col gap-4" onSubmit={generateRecipe}>
          <h1 className="text-4xl font-extrabold text-center">
            Generate a cooking recipe with AI!
          </h1>

          <Select name="cuisine" label="Select a cuisine type">
            <option disabled selected value="random">
              None
            </option>
            <option value="mexican">Mexican</option>
            <option value="italian">Italian</option>
            <option value="japanese">Japanese</option>
            <option value="indian">Indian</option>
            <option value="korean">Korean</option>
            <option value="thai">Thai</option>
          </Select>

          <Select name="mealType" label="Select type of meal">
            <option value="regular">Regular</option>
            <option value="light">Light</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </Select>

          <label className="flex flex-col font-semibold">
            Write a list of ingredients for the recipe (optional)
            <textarea
              className="border-black border-2 rounded-md text-lg p-2 text-black"
              name="ingredients"
              placeholder="Comma separated e.g. (tomato, milk, flour)"
              maxLength={200}
              onChange={onIngredientsChange}
            />
          </label>

          <ul className="list-disc font-semibold">
            {ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>

          <button
            className="bg-black text-white rounded-md text-lg p-2 font-semibold hover:bg-gray-900"
            type="submit"
          >
            {loading ? "Cooking..." : "Generate recipe"}
          </button>
        </form>

        {recipe ? (
          <div className="font-semibold rounded-md border-1 border-black my-4 bg-slate-100 p-4 text-black">
            {recipe
              .split("\n")
              .filter(Boolean)
              .map((str) => (
                <p key={str}>{str}</p>
              ))}
          </div>
        ) : null}

        {recipe && !loading ? (
          <button
            className="bg-black font-semibold text-white rounded-full py-2 px-4 self-center hover:bg-gray-900"
            type="button"
            onClick={copyToClipboard}
          >
            {copied ? "Copied! 📋️" : "Copy to clipboard 📋️"}
          </button>
        ) : null}
      </main>
      <footer
        ref={scrollCheckpointRef}
        className="flex flex-col col-start-2 col-end-8"
      >
        <hr />
        <div className="flex flex-col md:flex-row justify-between text-center md:text-left">
          <div className="p-6">
            Powered by{" "}
            <Link href="https://openai.com/blog/chatgpt">ChatGPT</Link> and{" "}
            <Link href="https://www.vercel.com">Vercel Edge Functions</Link>.
            Inspired by{" "}
            <Link href="https://www.twitterbio.com/">twitterBio.com</Link>
          </div>
          <div className="p-6">
            Made with ❤️ by{" "}
            <Link href="https://www.carlosavina.dev/">Carlos Aviña</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
