import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-password-reset-confirm',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIcon],
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
