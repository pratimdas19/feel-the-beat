import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { PlaylistResponse } from "../types";

// Prevent crash if API key is missing during initialization
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const generatePlaylistCover = async (mood: string): Promise<string | null> => {
  if (!apiKey) {
    console.warn("API Key is missing. Skipping image generation.");
    return null;
  }

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A high-quality, cinematic film photograph capturing the mood: "${mood}". Focus on atmospheric scenery, natural landscapes, or authentic urban vibes that feel human and grounded. Use soft lighting, 35mm film grain, and emotional depth. The image should feel like a real memory or a candid moment in time. Avoid abstract patterns, 3D renders, or text.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg'
      }
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64Image) {
      return `data:image/jpeg;base64,${base64Image}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating cover:", error);
    return null;
  }
};

export const generatePlaylistFromMood = async (mood: string): Promise<PlaylistResponse> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Generate a Spotify-style playlist of 40 songs for someone who is feeling: "${mood}".
    For each song, provide the title, artist, and a very brief reason why it fits the mood.
    Also create a catchy playlist name and a short description.
    Ensure the songs are real, popular, or indie gems that actually exist.
  `;

  try {
    if (!apiKey) {
        throw new Error("API Key is not configured in Vercel Environment Variables.");
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Disable safety filters to allow all moods (e.g. sad, angry)
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            playlistName: { type: Type.STRING },
            description: { type: Type.STRING },
            songs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  moodReason: { type: Type.STRING },
                  duration: { type: Type.STRING, description: "A plausible duration like 3:45" }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PlaylistResponse;
    } else {
      throw new Error("No response text received from Gemini");
    }
  } catch (error: any) {
    console.error("Error generating playlist:", error);
    
    // Provide a specific error description for the offline mode description
    const errorMsg = error.message?.includes("API Key") 
        ? "API Key Missing in Vercel" 
        : "AI Connection Failed";

    return {
      playlistName: "Vibe Check (Offline Mode)",
      description: `We couldn't reach the AI (${errorMsg}), but here's a vibe anyway.`,
      songs: [
        { title: "Midnight City", artist: "M83", moodReason: "Classic energetic indie feel.", duration: "4:03" },
        { title: "The Less I Know The Better", artist: "Tame Impala", moodReason: "Smooth psychedelic groove.", duration: "3:36" },
        { title: "Instant Crush", artist: "Daft Punk ft. Julian Casablancas", moodReason: "Melancholic nostalgia.", duration: "5:37" }
      ]
    };
  }
};