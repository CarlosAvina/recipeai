import { ChatGPTMessage, getOpenAIStream } from "@/utils/stream";

if (!process.env.OPEN_AI_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.4,
    max_tokens: 600,
    stream: true,
    n: 1,
  };

  const stream = await getOpenAIStream(payload);
  return new Response(stream);
}
