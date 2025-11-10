import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, REVISION_SYSTEM_PROMPT } from '../constants';

// These types are used by other components, so we keep them.
interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    }
}

export interface ReportResult {
    report: string;
    sources: GroundingChunk[];
}

// The platform provides the API key for client-side code via process.env.API_KEY.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

export const generateFinalReport = async (prompt: string): Promise<ReportResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                tools: [{ googleSearch: {} }],
            },
        });

        const report = response.text ?? '';
        const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) ?? [];

        return { report, sources };
    } catch (error) {
        console.error("Error generating final report:", error);
        if (error instanceof Error) {
            let friendlyMessage = `Failed to communicate with the AI model. Details: ${error.message}`;
            if (error.message.toLowerCase().includes("api key not valid")) {
                friendlyMessage = "The API key is invalid. Please check the environment variables.";
            } else if (error.message.toLowerCase().includes("permission denied")) {
                 friendlyMessage = "An API permission error occurred. The Google Search tool may not be enabled for your API key in your Google Cloud project, or your key may have incorrect referrer restrictions.";
            }
            throw new Error(friendlyMessage);
        }
        throw error;
    }
};

export const reviseAnswer = async (question: string, context: string, userAnswer: string): Promise<string> => {
    try {
        const fullPrompt = `Here is the context from my previous answers:\n${context || 'No context yet.'}\n\nQuestion being answered: "${question}"\n\nHere is the user's current answer that needs revision:\n"${userAnswer}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: REVISION_SYSTEM_PROMPT,
                temperature: 0.6,
            },
        });

        return response.text ?? '';

    } catch (error) {
        console.error("Error revising answer:", error);
        if (error instanceof Error) {
            let friendlyMessage = `Failed to communicate with the AI model. Details: ${error.message}`;
             if (error.message.toLowerCase().includes("api key not valid")) {
                friendlyMessage = "The API key is invalid. Please check the environment variables.";
            } else if (error.message.toLowerCase().includes("permission denied")) {
                 friendlyMessage = "An API permission error occurred. This can happen if your key has incorrect referrer restrictions.";
            }
            throw new Error(friendlyMessage);
        }
        throw error;
    }
};