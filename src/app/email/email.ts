import { Component, signal } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-email',
  imports: [],
  templateUrl: './email.html',
  styleUrl: './email.css',
})
export class Email {
  generatedEmail = signal<string>('');
  isLoading = signal<boolean>(false);

  async generateEmail() {
    this.isLoading.set(true);
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
      const email = data?.choices[0]?.message?.content;
      
      if (email) {
        this.generatedEmail.set(email);
        this.showSuccessPopup(email);
      } else {
        this.showErrorPopup('Failed to generate email. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.showErrorPopup(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  showSuccessPopup(email: string) {
    Swal.fire({
      icon: 'success',
      title: 'Email Generated Successfully!',
      html: `<div style="text-align: left; height: 350px; overflow-y: auto; padding: 10px; display: block;"><p style="white-space: pre-wrap; margin: 0;">${email}</p></div>`,
      confirmButtonText: 'Close',
      width: '600px',
      heightAuto: false,
      scrollbarPadding: false,
      didOpen: (modal) => {
        const popup = modal.querySelector('.swal2-popup') as HTMLElement;
        if (popup) {
          popup.style.display = 'flex';
          popup.style.flexDirection = 'column';
        }
        const htmlContainer = modal.querySelector('.swal2-html-container') as HTMLElement;
        if (htmlContainer) {
          htmlContainer.style.flex = '1';
          htmlContainer.style.overflow = 'visible';
        }
      },
      allowOutsideClick: false
    });
  }

  showErrorPopup(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Oops! Something went wrong',
      text: message,
      confirmButtonText: 'Try Again',
      allowOutsideClick: false
    });
  }
}
