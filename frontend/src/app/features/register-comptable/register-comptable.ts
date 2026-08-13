import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register-comptable',
  imports: [FormsModule],
  templateUrl: './register-comptable.html',
  styleUrl: './register-comptable.css',
})
export class RegisterComptable {
  nom = '';
  email = '';
  motDePasse = '';
  matricule = '';
  message = signal('');
  erreur = signal('');
  chargement = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.message.set('');
    this.erreur.set('');
    this.chargement.set(true);

    this.authService
      .registerComptable({
        nom: this.nom,
        email: this.email,
        mot_de_passe: this.motDePasse,
        matricule: this.matricule,
      })
      .subscribe({
        next: () => {
          this.message.set(`Compte comptable créé pour ${this.nom}.`);
          this.nom = '';
          this.email = '';
          this.motDePasse = '';
          this.matricule = '';
          this.chargement.set(false);
        },
        error: (err) => {
          const message =
            err.error?.email?.[0] ||
            err.error?.matricule?.[0] ||
            err.error?.mot_de_passe?.[0] ||
            "Erreur lors de la création du compte.";
          this.erreur.set(message);
          this.chargement.set(false);
        },
      });
  }
}