import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { SYSTEM_PROMPT, REVISION_SYSTEM_PROMPT } from '../../constants';

/**
 * Handles the logic for generating the final report.
 */
async function handleGenerateReport(ai: GoogleGenAI, body: any): Promise<HandlerResponse> {
    const { prompt } = body;
    if (!prompt) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt for report generation." }) };
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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


/**
 * Main handler for the serverless function.
 */
const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.GEMINI_SECRET_KEY;
    if (!apiKey) {
        console.error("FATAL: GEMINI_SECRET_KEY environment variable not set.");
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "Server is not configured correctly. The API key is missing." }),
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const body = JSON.parse(event.body || '{}');
        const { action } = body;

        let response: HandlerResponse;
        switch (action) {
            case 'generateReport':
                response = await handleGenerateReport(ai, body);
                break;
            case 'reviseAnswer':
                response = await handleReviseAnswer(ai, body);
                break;
            default:
                return { 
                    statusCode: 400, 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Invalid action specified.' }) 
                };
        }
        
        response.headers = { ...response.headers, 'Content-Type': 'application/json' };
        return response;

    } catch (error) {
        console.error("Gemini function execution error:", error);
        
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";

        let friendlyMessage = `Failed to communicate with the AI model for the final report. Details: ${errorMessage}`;
        if (errorMessage.toLowerCase().includes("api key not valid")) {
            friendlyMessage = "The server's API key is invalid. Please check the Netlify environment variables.";
        } else if (errorMessage.toLowerCase().includes("permission denied")) {
             friendlyMessage = "An API permission error occurred. The Google Search tool may not be enabled for your API key in your Google Cloud project.";
        }

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: friendlyMessage }),
        };
    }
};

export { handler };