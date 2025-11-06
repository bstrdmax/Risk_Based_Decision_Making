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

/**
 * A helper function to call our secure Netlify function.
 * This acts as a proxy to the Gemini API.
 * @param body The payload to send to the serverless function.
 * @returns The JSON response from the function.
 */
const callApiProxy = async (body: object) => {
    const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from the server.' }));
        throw new Error(errorData.error || `Server request failed with status ${response.status}`);
    }

    return response.json();
};


export const generateFinalReport = async (prompt: string): Promise<ReportResult> => {
    try {
        const result = await callApiProxy({
            action: 'generateReport',
            prompt: prompt,
        });
        return result as ReportResult;
    } catch (error) {
        console.error("Error generating final report via proxy:", error);
        // Re-throw a user-friendly message
        throw new Error("Failed to communicate with the AI model for the final report.");
    }
};

export const reviseAnswer = async (question: string, context: string, userAnswer: string): Promise<string> => {
    try {
        const result = await callApiProxy({
            action: 'reviseAnswer',
            question: question,
            context: context,
            userAnswer: userAnswer,
        });
        // The serverless function returns an object with a 'revisedText' property
        return result.revisedText;
    } catch (error) {
        console.error("Error revising answer via proxy:", error);
        // Re-throw a user-friendly message
        throw new Error("Failed to communicate with the AI model for a revision.");
    }
};
