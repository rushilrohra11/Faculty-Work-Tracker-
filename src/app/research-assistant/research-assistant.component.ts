import { Component } from '@angular/core';
import { AiService } from '../ai.service'; // Adjust path if necessary
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-research-assistant',
  templateUrl: './research-assistant.component.html',
  styleUrls: ['./research-assistant.component.css']
})
export class ResearchAssistantComponent {
  researchTopic: string = '';
  researchContent: any;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private aiService: AiService, private sanitizer: DomSanitizer) { }

  startResearch(): void {
    if (!this.researchTopic) {
      this.error = 'Please enter a research topic.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.researchContent = null;

    this.aiService.performResearch(this.researchTopic).subscribe({
      next: (response) => {
        // Sanitize the HTML to render it safely
        const sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(response.content.replace(/\n/g, '<br>'));
        this.researchContent = sanitizedContent;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error performing research', err);
        this.error = 'Failed to perform research. Please try again.';
        this.isLoading = false;
      }
    });
  }
} 