import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { config } from "dotenv";
import * as z from "zod";

config();

const getLyrics = tool(
  async ({ artist, title }) => {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) return `Could not fetch lyrics for "${title}" by ${artist}`;
      
      const data = await response.json();
      if (data.error) return `No lyrics found for "${title}" by ${artist}`;
      
      return data.lyrics.length > 2000 
        ? data.lyrics.substring(0, 2000) + "\n\n[Lyrics truncated...]"
        : data.lyrics;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  {
    name: "get_lyrics",
    description: "Get the lyrics of a song",
    schema: z.object({
      artist: z.string().describe("The artist name"),
      title: z.string().describe("The song title"),
    }),
  }
);

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0,
});

const modelWithTools = model.bindTools([getLyrics]);

const response = await modelWithTools.invoke([
  ["human", "What are the lyrics to Polly by Nirvana"]
]);

console.log("Tool calls:", response.tool_calls);

const toolResults = await Promise.all(
  response.tool_calls.map((toolCall) => getLyrics.invoke(toolCall))
);

const finalResponse = await modelWithTools.invoke([
  ["human", "What are the lyrics to Polly by Nirvana"],
  response,
  ...toolResults
]);

console.log(finalResponse.content);