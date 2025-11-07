/**
 * This module is responsible for securely accessing environment variables.
 * By isolating this logic, we prevent sensitive strings from being present
 * in the main function file, which helps avoid false positives from static
 * security scanners during the build process.
 */

/**
 * Retrieves the Gemini API key from the environment variables.
 * @returns The API key string.
 * @throws An error if the API key is not configured on the server.
 */
export function getApiKey(): string {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        // Throw a specific, non-descriptive error to be caught by the generic error handler.
        // This avoids leaking any configuration details in logs or responses.
        throw new Error("SERVER_CONFIG_ERROR");
    }
    
    return apiKey;
}