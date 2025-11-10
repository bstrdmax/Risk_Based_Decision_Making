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
 * A helper function to handle API calls to the Netlify serverless function.
 * @param action The specific action to perform (e.g., 'generateReport').
 * @param body The payload for the action.
 * @returns The JSON response from the server.
 */
async function callApi(action: string, body: object) {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, ...body }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            // Use the error message from the serverless function's response
            throw new Error(responseData.error || `Server responded with status ${response.status}`);
        }

        return responseData;
    } catch (error) {
        console.error(`API call for action "${action}" failed:`, error);
        // Re-throw the error to be caught by the component
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown network error occurred.');
    }
}


export const generateFinalReport = async (prompt: string): Promise<ReportResult> => {
    const data = await callApi('generateReport', { prompt });
    // The serverless function returns { report, sources }, which matches ReportResult.
    return data as ReportResult;
};

export const reviseAnswer = async (question: string, context: string, userAnswer: string): Promise<string> => {
    const data = await callApi('reviseAnswer', { question, context, userAnswer });
    // The serverless function returns { revisedText: "..." }
    return data.revisedText;
};