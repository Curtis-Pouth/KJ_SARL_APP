import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategorieProduit, StatistiquesProduits } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';
import { AppIcon } from '../../shared/components/icon/icon.component';

export interface CarteCategorieRecap {
  categorie: CategorieProduit;
  libelle: string;
  icone: string;
  nombre: number;
  colorClass: string;
  bgClass: string;
}

@Component({
  selector: 'app-recapitulatif',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIcon],
  templateUrl: './recapitulatif.html',
  styleUrl: './recapitulatif.css',
})
export class Recapitulatif implements OnInit {
  cartes = signal<CarteCategorieRecap[]>([]);
  chargement = signal(true);
  erreur = signal('');

  private readonly definitions: {
    categorie: CategorieProduit;
    libelle: string;
    icone: string;
    colorClass: string;
    bgClass: string;
  }[] = [
    {
      categorie: 'biere',
      libelle: 'Bières & Brassins',
      icone: 'beer',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      categorie: 'jus',
      libelle: 'Jus & Soft Drinks',
      icone: 'cup-soda',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-500/10 border-rose-500/30'
    },
    {
      categorie: 'eau',
      libelle: 'Eaux Minérales',
      icone: 'droplet',
      colorClass: 'text-sky-600',
      bgClass: 'bg-sky-500/10 border-sky-500/30'
    },
    {
      categorie: 'emballage',
      libelle: 'Emballages & Casiers',
      icone: 'package',
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-500/10 border-indigo-500/30'
    },
  ];

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.produitService.getStatistiques().subscribe({
      next: (stats: StatistiquesProduits) => {
        this.cartes.set(
          this.definitions.map((def) => ({
            ...def,
            nombre: stats.par_categorie[def.categorie] ?? 0,
          }))
        );
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Erreur de chargement du récapitulatif.');
        this.chargement.set(false);
      },
    });
  }
}