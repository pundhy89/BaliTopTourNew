import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Translation Route
  app.post("/api/translate", async (req, res) => {
    try {
      const { texts } = req.body;
      if (!texts || !Array.isArray(texts)) {
        return res.status(400).json({ error: "Invalid text format. Expected array of strings." });
      }

      // If no text, return empty lists
      if (texts.length === 0) {
        return res.json({ en: [], zh: [], id: [], fallback: false });
      }

      // Check if API key is set
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not defined. Falling back to source texts.");
        return res.json({
          en: texts,
          zh: texts,
          id: texts,
          fallback: true,
          reason: "api_key_missing"
        });
      }

      // Perform translation using gemini-3.5-flash
      const prompt = `You are a professional travel agency translator for Bali Top Tour.
Translate the following list of strings into English, Chinese (Simplified), and Indonesian.
Some inputs might be in Indonesian or English. Detect the source language, and translate accordingly, ensuring high-quality, professional, and accurate vocabulary fit for a tourism app.
Maintain the exact index position for each item.

Source texts array:
${JSON.stringify(texts, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              en: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "English translation corresponding to each source item in order."
              },
              zh: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Simplified Chinese translation corresponding to each source item in order."
              },
              id: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Indonesian translation corresponding to each source item in order."
              }
            },
            required: ["en", "zh", "id"]
          }
        }
      });

      let textOutput = response.text || "{}";
      textOutput = textOutput.trim();
      if (textOutput.startsWith("```")) {
        textOutput = textOutput.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      }
      
      const translatedData = JSON.parse(textOutput);
      res.json({
        en: translatedData.en || texts,
        zh: translatedData.zh || texts,
        id: translatedData.id || texts,
        fallback: false
      });
    } catch (error: any) {
      console.warn("Translation failed (using fallback):", error?.message || error);
      // Fallback to original text
      res.json({
        en: req.body.texts || [],
        zh: req.body.texts || [],
        id: req.body.texts || [],
        fallback: true,
        reason: error?.message || "unknown_error"
      });
    }
  });

  // Serve static assets in production, otherwise mount vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
