import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanierService } from '../../core/services/panier';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIcon],
  templateUrl: './panier.html',
  styleUrl: './panier.css',
})
export class Panier {
  chargement = signal(false);
  message = signal('');
  erreur = signal('');

  constructor(protected panierService: PanierService) {}

  augmenter(produitId: number, quantiteActuelle: number): void {
    this.panierService.modifierQuantite(produitId, quantiteActuelle + 1);
  }

  diminuer(produitId: number, quantiteActuelle: number): void {
    this.panierService.modifierQuantite(produitId, quantiteActuelle - 1);
  }

  retirer(produitId: number): void {
    this.panierService.retirer(produitId);
  }

  commander(): void {
    this.message.set('');
    this.erreur.set('');
    this.chargement.set(true);

    this.panierService.passerCommande().subscribe({
      next: () => {
        this.message.set('Votre commande a été enregistrée avec succès !');
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Erreur lors de l'envoi de la commande. Merci de réessayer.");
        this.chargement.set(false);
      },
    });
  }
}