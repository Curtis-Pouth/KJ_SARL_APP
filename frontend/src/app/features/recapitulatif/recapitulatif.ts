import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorieProduit, StatistiquesProduits } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';

interface CarteCategorie {
  categorie: CategorieProduit;
  libelle: string;
  icone: string;
  nombre: number;
}

@Component({
  selector: 'app-recapitulatif',
  imports: [RouterLink],
  templateUrl: './recapitulatif.html',
  styleUrl: './recapitulatif.css',
})
export class Recapitulatif implements OnInit {
  cartes = signal<CarteCategorie[]>([]);
  chargement = signal(true);
  erreur = signal('');

  private readonly definitions: { categorie: CategorieProduit; libelle: string; icone: string }[] = [
    { categorie: 'eau', libelle: 'Eau', icone: '💧' },
    { categorie: 'biere', libelle: 'Bière', icone: '🍺' },
    { categorie: 'emballage', libelle: 'Emballage', icone: '📦' },
    { categorie: 'jus', libelle: 'Jus', icone: '🧃' },
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