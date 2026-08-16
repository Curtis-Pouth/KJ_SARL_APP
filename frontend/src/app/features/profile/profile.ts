import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIcon],
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

  get initialesUtilisateur(): string {
    const utilisateur = this.authService.currentUser();
    const source = utilisateur?.nom?.trim() || utilisateur?.email?.split('@')[0] || 'KJ';
    const morceaux = source.split(/\s+/).filter(Boolean);
    return (morceaux.length > 1 ? morceaux[0][0] + morceaux[1][0] : source.slice(0, 2)).toUpperCase();
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