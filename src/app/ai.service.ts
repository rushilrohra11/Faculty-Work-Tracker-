import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  // Make sure this URL matches the port your backend server is running on
  private backendUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Sends a topic to the backend to perform research using the Gemini API.
   * @param topic The research topic provided by the user.
   * @returns An Observable with the research content.
   */
  performResearch(topic: string): Observable<{ content: string }> {
    return this.http.post<{ content: string }>(`${this.backendUrl}/research`, { topic });
  }

  /**
   * Sends an audio file to the backend for transcription using a speech-to-text API.
   * @param file The audio file to transcribe.
   * @returns An Observable with the transcribed text.
   */
  transcribeAudio(file: File): Observable<{ text: string }> {
    const formData = new FormData();
    formData.append('audioFile', file, file.name);
    return this.http.post<{ text: string }>(`${this.backendUrl}/transcribe`, formData);
  }

  /**
   * Sends text to the backend for summarization using the Gemini API.
   * @param text The text to be summarized.
   * @returns An Observable with the summarized text.
   */
  summarizeText(text: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.backendUrl}/summarize`, { text });
  }
}