// This file contains shared type definitions used across the application.

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    }
}

export interface ReportResult {
    report: string;
    sources: GroundingChunk[];
}
