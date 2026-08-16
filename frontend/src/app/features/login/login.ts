import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  motDePasse = '';
  erreur = signal('');
  chargement = signal(false);
  motDePasseVisible = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  basculerVisibiliteMotDePasse(): void {
    this.motDePasseVisible.update((v) => !v);
  }

  onSubmit(): void {
    this.erreur.set('');
    this.chargement.set(true);
    this.authService.login({ email: this.email, mot_de_passe: this.motDePasse }).subscribe({
      next: (response) => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        if (redirect) {
          this.router.navigateByUrl(redirect);
        } else if (response.role === 'client') {
          this.router.navigate(['/panier']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          typeof error.error?.detail === 'string'
            ? error.error.detail
            : 'Identifiants invalides ou service indisponible.';
        this.erreur.set(detail);
        this.chargement.set(false);
      },
    });
  }
}
