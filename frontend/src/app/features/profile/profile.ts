import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  ancienMotDePasse = '';
  nouveauMotDePasse = '';
  confirmationMotDePasse = '';

  message = signal('');
  erreur = signal('');
  chargement = signal(false);

  constructor(protected authService: AuthService) {}

  ngOnInit(): void {
    if (!this.authService.currentUser()) {
      this.authService.chargerUtilisateurCourant().subscribe();
    }
  }

  onSubmitChangePassword(): void {
    this.message.set('');
    this.erreur.set('');

    if (this.nouveauMotDePasse !== this.confirmationMotDePasse) {
      this.erreur.set('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    this.chargement.set(true);
    this.authService
      .changePassword(this.ancienMotDePasse, this.nouveauMotDePasse)
      .subscribe({
        next: () => {
          this.message.set('Mot de passe changé avec succès.');
          this.ancienMotDePasse = '';
          this.nouveauMotDePasse = '';
          this.confirmationMotDePasse = '';
          this.chargement.set(false);
        },
        error: (err) => {
          this.erreur.set(err.error?.ancien_mot_de_passe?.[0] || 'Une erreur est survenue.');
          this.chargement.set(false);
        },
      });
  }
}