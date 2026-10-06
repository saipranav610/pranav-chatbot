require("dotenv").config({
    path: "../.env"
});

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing from .env");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: "Messages are required"
            });
        }

        const contents = messages.map(message => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [
                {
                    text: message.content
                }
            ]
        }));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents
        });

        res.json({
            reply: {
                role: "assistant",
                content: response.text
            }
        });

    } catch (error) {
        console.error("Gemini API Error:", error);

        res.status(500).json({
            error: "Failed to get response from Gemini"
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});