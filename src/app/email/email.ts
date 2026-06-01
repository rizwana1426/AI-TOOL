import { Component, signal, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-email',
  imports: [ReactiveFormsModule],
  templateUrl: './email.html',
  styleUrl: './email.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Email {
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    whoAmI: ['', [Validators.required, Validators.minLength(2)]],
    writingTo: ['', [Validators.required, Validators.minLength(2)]],
    whatIWant: ['', [Validators.required, Validators.minLength(2)]],
  });
  // Add at top of class
  isDemoExpired = false;
  demoMessage = '';

  // Call in constructor
  constructor() {
    this.checkDemoExpiry();
  }
  generatedEmail = signal<string>('');
  isLoading = signal<boolean>(false);

  isFormValid = computed(() => {
    const isValid = this.form.valid && !this.isLoading();
    return isValid;
  });

  // Add this function
  checkDemoExpiry() {
    const deployDate = new Date('2027-05-17');
    const expiryDate = new Date(deployDate);
    expiryDate.setDate(expiryDate.getDate() + 7);

    const today = new Date();

    if (today > expiryDate) {
      this.isDemoExpired = true;
      this.demoMessage = 'Demo expired. Contact rizwana1426@outlook.com for access.';
    }
  }
  async generateEmail() {
    if (!this.form.valid) {
      this.showErrorPopup('Please fill all 3 fields before generating.');
      return;
    }

    const { whoAmI, writingTo, whatIWant } = this.form.value;
    this.isLoading.set(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${environment.groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: `Write a professional email with these details:
- I am: ${whoAmI}
- Writing to: ${writingTo}
- My purpose: ${whatIWant}

Rules:
- Start with "Subject:" at the very beginning. No spaces before it.
- Then write the email body.
- No extra indentation anywhere.
- Keep it polite and professional.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const email = data?.choices[0]?.message?.content?.trim();

      if (email) {
        this.generatedEmail.set(email);
        this.showSuccessPopup(email);
      } else {
        this.showErrorPopup('Failed to generate email. Please try again.');
      }
    } catch (error) {
      this.showErrorPopup(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      this.isLoading.set(false);
    }
  }

  showSuccessPopup(email: string) {
    const lines = email.split('\n');

    const htmlContent = lines
      .map((line) => {
        if (line.startsWith('Subject:')) {
          return `<div class="email-subject">${line}</div>`;
        }

        return `<div class="email-line">${line || '&nbsp;'}</div>`;
      })
      .join('');

    Swal.fire({
      icon: 'success',

      title: 'Email Generated Successfully!',

      html: `
      <div class="email-container">
        ${htmlContent}
      </div>

      <button
        class="copy-btn"
        onclick="navigator.clipboard.writeText(atob('${btoa(email)}'))"
      >
        📋 Copy Email
      </button>
    `,
      footer: `
    <div class="watermark">
        Built by <a href="https://instagram.com/tech_rizwana" target="_blank">@tech_rizwana</a> 🚀
    </div>
  `,

      confirmButtonText: 'Close',
      customClass: {
        popup: 'email-popup',
      },

      allowOutsideClick: false,

      willClose: () => {
        // clear signal
        this.generatedEmail.set('');

        // clear form fields
        this.form.reset();
      },
    });
  }

  showErrorPopup(message: string) {
    Swal.fire({
      icon: 'error',
      html: `<p class="error-message"><strong>${message}</strong></p>`,
      confirmButtonText: 'Try Again',
      customClass: { popup: 'error-popup' },
      allowOutsideClick: false,
    });
  }
}
