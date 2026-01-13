import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const agent = new ChatGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0,
  maxRetries: 2,
})

const response = 
  await agent.invoke([
    ["system", "You are an assistant that helps the user solve today's wordle: A 5 letter word guessing game: G = Green, Y = Yellow, X = Grey/Not in word"],
    ["human", "IRATE = XXXXX CLOUD = XXYYX USHER = YXXXX"]
  ]);

console.log(response.content)