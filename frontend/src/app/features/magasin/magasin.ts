import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategorieProduit, Produit } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-magasin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIcon],
  templateUrl: './magasin.html',
  styleUrl: './magasin.css',
})
export class Magasin implements OnInit {
  produits = signal<Produit[]>([]);
  chargement = signal(true);
  erreur = signal('');
  filtre = '';

  quantitesARecharger: Record<number, number | null> = {};
  rechargeEnCours = signal<number | null>(null);
  alerteStockFaible = signal('');

  photoEnCours = signal<number | null>(null);
  erreurPhoto = signal('');

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  onFichierPhotoSelectionne(produit: Produit, event: Event): void {
    this.erreurPhoto.set('');
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];

    if (!fichier) {
      return;
    }

    this.photoEnCours.set(produit.id);
    this.produitService.uploaderPhoto(produit.id, fichier).subscribe({
      next: (produitMisAJour) => {
        this.produits.update((liste) =>
          liste.map((p) => (p.id === produit.id ? produitMisAJour : p))
        );
        this.photoEnCours.set(null);
        input.value = '';
      },
      error: () => {
        this.erreurPhoto.set(`Erreur lors de l'envoi de la photo pour "${produit.libelle}".`);
        this.photoEnCours.set(null);
        input.value = '';
      },
    });
  }

  chargerProduits(): void {
    this.chargement.set(true);
    this.produitService.getAll().subscribe({
      next: (data) => {
        this.produits.set(data);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Erreur de chargement des produits.');
        this.chargement.set(false);
      },
    });
  }

  produitsFiltres(): Produit[] {
    const filtre = this.filtre.trim().toLowerCase();
    if (!filtre) {
      return this.produits();
    }
    return this.produits().filter(
      (p) =>
        p.libelle.toLowerCase().includes(filtre) ||
        (p.reference ?? '').toLowerCase().includes(filtre)
    );
  }

  recharger(produit: Produit): void {
    this.alerteStockFaible.set('');
    const quantite = this.quantitesARecharger[produit.id];

    if (!quantite || quantite <= 0) {
      return;
    }

    this.rechargeEnCours.set(produit.id);
    const nouvelleQuantite = produit.quantite_en_stock + quantite;

    this.produitService.update(produit.id, { quantite_en_stock: nouvelleQuantite }).subscribe({
      next: (produitMisAJour) => {
        this.produits.update((liste) =>
          liste.map((p) => (p.id === produit.id ? produitMisAJour : p))
        );
        this.quantitesARecharger[produit.id] = null;
        this.rechargeEnCours.set(null);

        if (produitMisAJour.stock_faible) {
          this.alerteStockFaible.set(
            `Attention : le stock de "${produitMisAJour.libelle}" est encore faible (${produitMisAJour.quantite_en_stock} unités, seuil : 50).`
          );
        }
      },
      error: () => {
        this.erreur.set('Erreur lors de la mise à jour du stock.');
        this.rechargeEnCours.set(null);
      },
    });
  }

  libelleCategorie(categorie: CategorieProduit): string {
    const libelles: Record<CategorieProduit, string> = {
      eau: 'Eaux',
      biere: 'Bières',
      emballage: 'Emballages',
      jus: 'Jus & Softs',
    };
    return libelles[categorie] ?? categorie;
  }

  iconeCategorie(categorie: CategorieProduit): string {
    switch (categorie) {
      case 'biere': return 'beer';
      case 'jus': return 'cup-soda';
      case 'eau': return 'droplet';
      case 'emballage': return 'package';
      default: return 'tag';
    }
  }
}