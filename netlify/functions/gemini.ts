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
        console.error("Server API access token is not set in environment variables.");
        return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: Missing access token. Please set the required environment variable in your Netlify site settings." }) };
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
        
        let errorMessage = "An internal error occurred while communicating with the AI model.";
        let statusCode = 500;

        if (error instanceof Error && error.message) {
            const lowerCaseMessage = error.message.toLowerCase();
            // Check for specific error messages related to API keys from Google's API
            if (lowerCaseMessage.includes('api key not valid')) {
                errorMessage = "The provided access token is not valid. Please check it in the Netlify environment variables and ensure it is correct.";
                statusCode = 401; // Unauthorized
            } else if (lowerCaseMessage.includes('permission denied') || lowerCaseMessage.includes('gemini api has not been used')) {
                errorMessage = "The access token is missing required permissions or the Gemini API has not been enabled for your project. Please check your Google Cloud project settings.";
                statusCode = 403; // Forbidden
            } else if (lowerCaseMessage.includes('quota')) {
                errorMessage = "API quota exceeded. Please check your Google Cloud billing account or API usage limits.";
                statusCode = 429; // Too Many Requests
            }
        }
        
        return {
            statusCode: statusCode,
            body: JSON.stringify({ error: errorMessage }),
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
