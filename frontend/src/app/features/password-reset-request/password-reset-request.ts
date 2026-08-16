import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-password-reset-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIcon],
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
        this.message.set('Code envoyé ! Redirection vers la page de confirmation...');
        setTimeout(
          () =>
            this.router.navigate(['/password-reset-confirm'], {
              queryParams: { email: this.email },
            }),
          1200
        );
      },
      error: () => {
        this.erreur.set('Aucun compte trouvé avec cette adresse email.');
        this.chargement.set(false);
      },
    });
  }
}
