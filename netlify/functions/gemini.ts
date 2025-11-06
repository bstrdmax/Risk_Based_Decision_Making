import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";
import { SYSTEM_PROMPT, REVISION_SYSTEM_PROMPT } from '../../constants';

// This is the main handler for our serverless function.
const handler: Handler = async (event: HandlerEvent) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Ensure the API key is set in Netlify's environment variables
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: Missing API key." }) };
    }

    // Initialize the Gemini client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const body = JSON.parse(event.body || '{}');
        const { action } = body;

        // Route requests based on the 'action' property in the request body
        switch (action) {
            case 'generateReport':
                return await handleGenerateReport(ai, body);
            case 'reviseAnswer':
                return await handleReviseAnswer(ai, body);
            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action specified.' }) };
        }
    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "An internal error occurred while communicating with the AI model." }),
        };
    }
};

// Handles the logic for generating the final report
async function handleGenerateReport(ai: GoogleGenAI, body: any) {
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

// Handles the logic for revising an answer
async function handleReviseAnswer(ai: GoogleGenAI, body: any) {
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
