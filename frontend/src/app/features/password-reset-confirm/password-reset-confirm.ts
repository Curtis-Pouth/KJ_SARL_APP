import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-password-reset-confirm',
  imports: [FormsModule],
  templateUrl: './password-reset-confirm.html',
  styleUrl: './password-reset-confirm.css',
})
export class PasswordResetConfirm implements OnInit {
  email = '';
  code = '';
  nouveauMotDePasse = '';
  erreur = signal('');
  chargement = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });
  }

  onSubmit(): void {
    this.erreur.set('');
    this.chargement.set(true);
    this.authService
      .confirmPasswordReset(this.email, this.code, this.nouveauMotDePasse)
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => {
          this.erreur.set('Code invalide ou expiré.');
          this.chargement.set(false);
        },
      });
  }
}
