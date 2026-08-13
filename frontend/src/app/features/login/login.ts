import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  motDePasse = '';
  erreur = signal('');
  chargement = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  motDePasseVisible = signal(false);

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
      error: () => {
        this.erreur.set('Identifiants invalides.');
        this.chargement.set(false);
      },
    });
  }
}