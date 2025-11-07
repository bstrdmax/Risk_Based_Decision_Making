import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { SYSTEM_PROMPT, REVISION_SYSTEM_PROMPT } from '../../constants';

let ai: GoogleGenAI;

/**
 * Initializes and returns a singleton instance of the GoogleGenAI client.
 * Throws a specific error if the required environment variable is not set.
 */
function getAiClient(): GoogleGenAI {
    if (ai) {
        return ai;
    }
    
    if (!process.env.API_KEY) {
        // Use a non-descript error code to be caught by the error handler.
        throw new Error("SERVER_CONFIG_ERROR");
    }

    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
}

/**
 * Handles errors gracefully, providing a generic message to the client
 * while logging specifics on the server. This prevents leaking implementation
 * details or tripping up security scanners.
 * @param error The error object.
 * @returns A structured HandlerResponse.
 */
function handleApiError(error: unknown): HandlerResponse {
    console.error("Internal API Error:", error);

    let errorMessage = "An unexpected error occurred while processing your request.";
    let statusCode = 500;

    if (error instanceof Error) {
        if (error.message === "SERVER_CONFIG_ERROR") {
            errorMessage = "A server configuration issue is preventing the request. Please contact the administrator.";
        } else {
            const msg = error.message.toLowerCase();
            if (msg.includes("permission") || msg.includes("denied") || msg.includes("not valid")) {
                statusCode = 401; // Unauthorized
                errorMessage = "The request could not be authenticated. Please check service credentials.";
            } else if (msg.includes("quota")) {
                statusCode = 429; // Too Many Requests
                errorMessage = "The service usage limit has been reached. Please try again later.";
            }
        }
    }

    return {
        statusCode: statusCode,
        body: JSON.stringify({ error: errorMessage }),
    };
}

/**
 * Main handler for the serverless function.
 */
const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const aiClient = getAiClient();
        const body = JSON.parse(event.body || '{}');
        const { action } = body;

        switch (action) {
            case 'generateReport':
                return await handleGenerateReport(aiClient, body);
            case 'reviseAnswer':
                return await handleReviseAnswer(aiClient, body);
            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action specified.' }) };
        }
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Handles the logic for generating the final report.
 */
async function handleGenerateReport(ai: GoogleGenAI, body: any): Promise<HandlerResponse> {
    const { prompt } = body;
    if (!prompt) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt for report generation." }) };
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ googleSearch: {} }],
        },
    });

    const report = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    return {
        statusCode: 200,
        body: JSON.stringify({ report, sources }),
    };
}

/**
 * Handles the logic for revising an answer.
 */
async function handleReviseAnswer(ai: GoogleGenAI, body: any): Promise<HandlerResponse> {
    const { question, context, userAnswer } = body;
    if (!question || !userAnswer) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing parameters for answer revision." }) };
    }

    const prompt = `Here is the context from my previous answers:\n${context || 'No context yet.'}\n\nQuestion being answered: "${question}"\n\nHere is the user's current answer that needs revision:\n"${userAnswer}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: REVISION_SYSTEM_PROMPT,
            temperature: 0.6,
        },
    });
    
    return {
        statusCode: 200,
        body: JSON.stringify({ revisedText: response.text }),
    };
}

export { handler };
