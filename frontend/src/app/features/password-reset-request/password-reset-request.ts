import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-password-reset-request',
  imports: [FormsModule],
  templateUrl: './password-reset-request.html',
  styleUrl: './password-reset-request.css',
})
export class PasswordResetRequest {
  email = '';
  message = signal('');
  erreur = signal('');
  chargement = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.message.set('');
    this.erreur.set('');
    this.chargement.set(true);
    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.message.set('Code envoyé, vérifiez votre email.');
        setTimeout(
          () =>
            this.router.navigate(['/password-reset-confirm'], {
              queryParams: { email: this.email },
            }),
          1200
        );
      },
      error: () => {
        this.erreur.set('Aucun compte trouvé avec cet email.');
        this.chargement.set(false);
      },
    });
  }
}
