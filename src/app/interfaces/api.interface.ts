export interface TranscriptionResponse {
    success: boolean;
    transcription: string;
    summary?: string;
    error?: string;
}

export interface SummaryResponse {
    success: boolean;
    summary: string;
    error?: string;
}
