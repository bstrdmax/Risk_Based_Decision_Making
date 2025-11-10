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
 * A helper function to handle API responses from our Netlify function.
 * It checks for errors and parses the JSON response.
 * @param response The fetch Response object.
 * @returns The parsed JSON data.
 */
async function handleApiResponse(response: Response) {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { 
                error: `Request failed with status: ${response.status} ${response.statusText}. The server returned a non-JSON response.` 
            };
        }

        // Log the detailed error for debugging if it exists
        if (errorData.originalError) {
            console.error("--- Detailed Server Error ---");
            console.error(errorData.originalError);
            console.error("-----------------------------");
        }

        // Use the user-friendly error message from the serverless function's response body for the UI
        throw new Error(errorData.error || `An unknown server error occurred.`);
    }
    return response.json();
}

/**
 * Sends the final report generation request to our secure Netlify function.
 * @param prompt The complete prompt for the report.
 * @returns A promise that resolves to the generated report and its sources.
 */
export const generateFinalReport = async (prompt: string): Promise<ReportResult> => {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateReport',
                prompt: prompt,
            }),
        });
        
        const result = await handleApiResponse(response);
        return result as ReportResult;

    } catch (error) {
        console.error("Service Error (generateFinalReport):", error);
        // The error is already formatted by handleApiResponse. Re-throw for the UI.
        throw error;
    }
};

/**
 * Sends the answer revision request to our secure Netlify function.
 * @param question The question being answered.
 * @param context The context from previous answers.
 * @param userAnswer The user's current answer to revise.
 * @returns A promise that resolves to the revised text.
 */
export const reviseAnswer = async (question: string, context: string, userAnswer: string): Promise<string> => {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'reviseAnswer',
                question,
                context,
                userAnswer,
            }),
        });
        
        const result = await handleApiResponse(response);
        return result.revisedText;

    } catch (error) {
        console.error("Service Error (reviseAnswer):", error);
        // The error is already formatted by handleApiResponse. Re-throw for the UI.
        throw error;
    }