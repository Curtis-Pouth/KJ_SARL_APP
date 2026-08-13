import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  nom = '';
  email = '';
  motDePasse = '';
  adresseLivraison = '';
  erreur = signal('');
  chargement = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  motDePasseVisible = signal(false);

  basculerVisibiliteMotDePasse(): void {
    this.motDePasseVisible.update((v) => !v);
  }

  onSubmit(): void {
    this.erreur.set('');
    this.chargement.set(true);
    this.authService
      .registerClient({
        nom: this.nom,
        email: this.email,
        mot_de_passe: this.motDePasse,
        adresse_livraison: this.adresseLivraison,
      })
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          const message =
            err.error?.email?.[0] ||
            err.error?.adresse_livraison?.[0] ||
            err.error?.mot_de_passe?.[0] ||
            "Erreur lors de l'inscription.";
          this.erreur.set(message);
          this.chargement.set(false);
        },
      });
  }
}