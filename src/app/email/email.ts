import { Component } from '@angular/core';

@Component({
  selector: 'app-email',
  imports: [],
  templateUrl: './email.html',
  styleUrl: './email.css',
})
export class Email {
  generatedEmail: string = '';

  async generateEmail() {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer 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"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "user",
                content: "Write a short professional email to a client asking for project feedback"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        this.generatedEmail = data.choices[0].message.content;
      } else {
        console.error('Unexpected response structure:', data);
      }
    } catch (error) {
      console.error('Failed to generate email:', error);
    }
  }
}
