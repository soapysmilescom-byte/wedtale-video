import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser for base64 photo uploads
  app.use(express.json({ limit: "25mb" }));

  // Helper to get Gemini client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API: Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // API: Analyze Bride & Groom Photos and Generate 3D Pixar Caricature Persona
  app.post("/api/analyze-couple", async (req, res) => {
    try {
      const {
        bridePhoto,
        groomPhoto,
        brideName = "Bride",
        groomName = "Groom",
        stateTheme = "Pan-Indian / Bollywood Glam",
        brideAttire = "",
        groomAttire = "",
      } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Return rich default caricature descriptors if Gemini key not set
        return res.json({
          success: true,
          isMock: true,
          caricatureDetails: {
            groom: {
              features: `Charming Pixar 3D caricature of ${groomName} in ${groomAttire || 'royal embroidered sherwani'}, warm dark hair, joyful smile.`,
              expression: "Lovestruck, beaming with joy and adoration",
            },
            bride: {
              features: `Radiant Pixar 3D caricature of ${brideName} in ${brideAttire || 'exquisite wedding lehenga'}, big expressive sparkling eyes, glowing bridal smile.`,
              expression: "Tearful with ecstatic happiness, hand on heart",
            },
            vibe: `${stateTheme} royal wedding aesthetic with fairy lights, auspicious floral decorations and cinematic Pixar glow`,
            scenePrompts: {
              scene1: `Cute 3D Pixar Disney style caricature of ${groomName} kneeling on one knee proposing with glowing diamond ring to emotional ${brideName}.`,
              scene2: `Cute 3D Pixar couple ${groomName} & ${brideName} romantic waltz dance under floral canopy.`,
              scene3: `Cute 3D Pixar caricature of ${groomName} and ${brideName} in traditional ${stateTheme} wedding attire.`,
              scene4: `3D Pixar grand royal wedding announcement with ${brideName} and ${groomName} under traditional floral mandap.`,
            },
          },
        });
      }

      // Build parts for multimodal prompt
      const parts: any[] = [];
      
      let hasPhotos = false;
      if (bridePhoto && bridePhoto.includes("base64,")) {
        const [meta, data] = bridePhoto.split("base64,");
        const mimeType = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
        parts.push({
          inlineData: { mimeType, data },
        });
        hasPhotos = true;
      }

      if (groomPhoto && groomPhoto.includes("base64,")) {
        const [meta, data] = groomPhoto.split("base64,");
        const mimeType = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
        parts.push({
          inlineData: { mimeType, data },
        });
        hasPhotos = true;
      }

      const promptText = `
You are a lead Pixar 3D Character Stylist and wedding director specializing in Indian cultural weddings.
Analyze the couple: Bride named "${brideName}" and Groom named "${groomName}".
Selected Indian State Wedding Theme: "${stateTheme}".
Traditional Regional Attire Context:
- Bride Attire: ${brideAttire}
- Groom Attire: ${groomAttire}

${hasPhotos ? "Based on the uploaded photos of the bride and groom, identify their facial characteristics (hair color/texture, face shape, smile, eye shape, skin tone)." : "Create a romantic Pixar couple caricature."}
Incorporate the authentic regional Indian attire, jewelry, turbans/saris, and cultural wedding motifs of ${stateTheme} into their 3D Pixar designs!

Generate a 3D Pixar cute caricature profile and custom scene descriptors for a 4-scene romantic wedding invitation video:
Scene 1: "Finally" (Groom proposing on one knee with sparkling diamond ring)
Scene 2: "The Wait is Over" (Couple romantic waltz dance holding hands)
Scene 3: "We are making it official" (Couple in festive ${stateTheme} wedding attire)
Scene 4: "We are getting married" (Royal announcement invitation ceremony)

Return ONLY valid JSON with this structure:
{
  "groom": {
    "features": "description of groom's 3D Pixar character appearance and regional wedding attire",
    "expression": "proposal & dance emotion"
  },
  "bride": {
    "features": "description of bride's 3D Pixar character appearance and regional bridal attire/jewelry",
    "expression": "emotional joyful expression"
  },
  "vibe": "color palette and lighting style inspired by ${stateTheme} wedding",
  "romanticQuote": "a sweet 1-line couple quote",
  "scenePrompts": {
    "scene1": "prompt for Finally proposal scene",
    "scene2": "prompt for Wait is Over dance scene",
    "scene3": "prompt for We are making it official scene in ${stateTheme} style",
    "scene4": "prompt for We are getting married scene"
  }
}
`;
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const caricatureDetails = JSON.parse(responseText);

      return res.json({
        success: true,
        caricatureDetails,
      });
    } catch (err: any) {
      console.error("Error in /api/analyze-couple:", err);
      return res.status(500).json({
        error: err.message || "Failed to analyze couple photos",
      });
    }
  });

  // API: Live AI Image Generation (Optional 3D Pixar Caricature generation)
  app.post("/api/generate-caricature", async (req, res) => {
    try {
      const { prompt, sceneNumber } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(400).json({
          error: "Gemini API key is not configured. Using pre-rendered 3D Pixar studio scenes.",
        });
      }

      const enhancedPrompt = `Cute 3D Pixar Disney animated movie style caricature, 8k octane render, cute stylized proportions, big expressive emotional eyes, warm cinematic lighting: ${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16",
          },
        },
      });

      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ error: "No image was returned by the model" });
      }

      return res.json({ success: true, imageUrl });
    } catch (err: any) {
      console.error("Error in /api/generate-caricature:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate caricature image",
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pixar Wedding Video Studio running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
