import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategorieProduit, Produit } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';
import { AppIcon } from '../../shared/components/icon/icon.component';

const LIBELLES_CATEGORIES: Record<CategorieProduit, string> = {
  eau: 'Eaux Minérales',
  biere: 'Bières & Brassins',
  emballage: 'Emballages & Casiers',
  jus: 'Jus & Soft Drinks',
};

@Component({
  selector: 'app-recapitulatif-categorie',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIcon],
  templateUrl: './recapitulatif-categorie.html',
  styleUrl: './recapitulatif-categorie.css',
})
export class RecapitulatifCategorie implements OnInit {
  categorie = signal<CategorieProduit>('eau');
  produits = signal<Produit[]>([]);
  chargement = signal(true);
  erreur = signal('');

  constructor(private route: ActivatedRoute, private produitService: ProduitService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const categorie = (params.get('categorie') as CategorieProduit) ?? 'eau';
      this.categorie.set(categorie);
      this.chargerProduits(categorie);
    });
  }

  private chargerProduits(categorie: CategorieProduit): void {
    this.chargement.set(true);
    this.produitService.getAll().subscribe({
      next: (data) => {
        this.produits.set(data.filter((p) => p.categorie === categorie));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Erreur de chargement des produits.');
        this.chargement.set(false);
      },
    });
  }

  libelleCategorie(): string {
    return LIBELLES_CATEGORIES[this.categorie()] ?? this.categorie();
  }

  iconeCategorie(): string {
    switch (this.categorie()) {
      case 'biere': return 'beer';
      case 'jus': return 'cup-soda';
      case 'eau': return 'droplet';
      case 'emballage': return 'package';
      default: return 'tag';
    }
  }

  quantiteTotale(): number {
    return this.produits().reduce((total, p) => total + p.quantite_en_stock, 0);
  }
}