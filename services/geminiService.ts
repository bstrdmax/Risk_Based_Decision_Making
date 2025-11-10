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

export const generateFinalReport = async (prompt: string): Promise<ReportResult> => {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generateReport', prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data as ReportResult;
    } catch (error) {
        console.error("Error generating final report:", error);
        throw error;
    }
};

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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.revisedText;

    } catch (error) {
        console.error("Error revising answer:", error);
        throw error;
    }
};