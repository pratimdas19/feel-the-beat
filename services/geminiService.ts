import { GoogleGenAI, Type } from "@google/genai";
import { PlaylistResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePlaylistFromMood = async (mood: string): Promise<PlaylistResponse> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Generate a Spotify-style playlist of 20 songs for someone who is feeling: "${mood}".
    For each song, provide the title, artist, and a very brief reason why it fits the mood.
    Also create a catchy playlist name and a short description.
    Ensure the songs are real, popular, or indie gems that actually exist.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
  } catch (error) {
    console.error("Error generating playlist:", error);
    // Fallback mock data in case of error (or API quota limits in demo)
    return {
      playlistName: "Vibe Check (Offline)",
      description: "We couldn't reach the AI, but here's a vibe anyway.",
      songs: [
        { title: "Midnight City", artist: "M83", moodReason: "Classic energetic indie feel.", duration: "4:03" },
        { title: "The Less I Know The Better", artist: "Tame Impala", moodReason: "Smooth psychedelic groove.", duration: "3:36" },
        { title: "Instant Crush", artist: "Daft Punk ft. Julian Casablancas", moodReason: "Melancholic nostalgia.", duration: "5:37" }
      ]
    };
  }
};
