const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

app.post("/api/chat", async (req, res) => {
  const { sessionId, userMessage, concept } = req.body;
  console.log("📩 Incoming:", { sessionId, userMessage, concept });

  let responseText = "";

  try {
    const prompt = `You are a curious child learning about ${concept}. The teacher says: "${userMessage}". Respond like a 5-year-old, asking a question or saying something curious.`;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.8
    });

    responseText = completion.choices[0].message.content?.trim() || "";
    console.log("✅ AI:", responseText);
  } catch (error) {
    console.error("🔥 OpenRouter Error:", error.response?.data || error.message || error);
    responseText = "Sorry, the AI had a thinking problem!";
  }

  res.json({ aiMessage: responseText });
});

app.listen(3001, () => console.log("🚀 Server running on http://localhost:3001"));