import type { NextApiRequest, NextApiResponse } from "next";

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

type Data = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<Choice>;
  usage: Usage;
};

if (!process.env.OPEN_AI_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { prompt } = req.body;

  if (!prompt) {
    return new Response("No promnt in the request", { status: 400 });
  }

  const body = JSON.stringify({
    model: "text-davinci-003",
    prompt,
    temperature: 0.4,
    max_tokens: 500,
  });

  const response = await fetch(" https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_AI_KEY ?? ""}`,
    },
    method: "POST",
    body,
  });

  const json: Data = await response.json();

  res.status(200).json(json);
}
