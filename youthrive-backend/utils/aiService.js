import { GoogleGenAI } from "@google/genai";

let client = null;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

export const isAIEnabled = () => Boolean(process.env.GEMINI_API_KEY);

export const generateContent = async (prompt, systemInstruction, options = {}) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { systemInstruction, ...options },
  });
  return response.text;
};

export const parseJSON = (text) => {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    throw new Error("Failed to parse AI response as JSON");
  }
};

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------
export const SYSTEM_PROMPTS = {
  weekly: `You are YouThrive's AI coach. Write a short, encouraging weekly
recap (3-5 sentences) of the user's habit data: highlight their strongest
streak, gently note one habit that slipped, and suggest one focus for next
week.`,

  suggestion: `You are a habit-formation expert. Based on the user's goals,
most productive time of day, and current struggles, suggest exactly 3 new
habits they could start. Respond ONLY with valid JSON in this exact shape:
{"suggestions": [
  {"icon": "single emoji", "name": "short habit name", "category": "one word like Health, Focus, Mindfulness", "frequency": "e.g. Daily or 3x/week", "description": "one sentence describing the habit", "reason": "one sentence on why it fits this specific user"}
], "reasoning": "string"}
Suggestions should be small and realistic, reducing friction rather than
relying on willpower.`,

  recovery: `You are YouThrive's AI coach. The user missed days on a habit.
In 2-4 sentences, normalize the lapse without guilt or shame, and give one
small, easy way to restart today.`,

  chat: `You are YouThrive's AI coach. You will be given the user's question and
a JSON block of their habit data for the last 30 days, including each habit's
completionsByDayOfWeek and an overall aggregated totalsByDayOfWeek across all
habits.

Always answer the user's actual question directly and specifically using the
data provided — compute totals, find the max/min day, compare habits, etc. as
needed. Reference real numbers and day names from the data in your answer.
Only add brief encouragement after answering the question, never instead of
answering it. If the data is insufficient to answer confidently (e.g. too few
logs), say so explicitly rather than giving a generic motivational reply.
Keep replies concise and specific.`,

  morning: `You are YouThrive's AI coach. In 2-3 sentences, give the user an
upbeat morning nudge based on their habits and streaks, naming one habit to
prioritize today.`,
};

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------
export const generateWeeklySummary = (habits) =>
  generateContent(JSON.stringify(habits, null, 2), SYSTEM_PROMPTS.weekly);

export const generateHabitSuggestions = async (habit) => {
  const text = await generateContent(
    JSON.stringify(habit, null, 2),
    SYSTEM_PROMPTS.suggestion
  );
  return parseJSON(text);
};

export const generateRecoveryMessage = (habit) =>
  generateContent(JSON.stringify(habit, null, 2), SYSTEM_PROMPTS.recovery);

export const askCoach = (message) =>
  generateContent(message, SYSTEM_PROMPTS.chat);

export const generateMorningCheckIn = (habits) =>
  generateContent(JSON.stringify(habits, null, 2), SYSTEM_PROMPTS.morning);