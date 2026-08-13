import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorieProduit, StatistiquesProduits } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';
import { StatistiquesClients } from '../../core/models/facturation';
import { FacturationService } from '../../core/services/facturation';

interface CarteCategorie {
  categorie: CategorieProduit;
  libelle: string;
  nombre: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Nettoyé : RouterLink et RouterLinkActive retirés
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  statistiques = signal<StatistiquesProduits | null>(null);
  statistiquesClients = signal<StatistiquesClients | null>(null);
  chargement = signal(true);
  chargementClients = signal(true);
  erreur = signal('');

  cartesCategories = computed<CarteCategorie[]>(() => {
    const stats = this.statistiques();
    const parCategorie = stats?.par_categorie;

    return [
      { categorie: 'eau', libelle: 'Eau', nombre: parCategorie?.eau ?? 0 },
      { categorie: 'biere', libelle: 'Biere', nombre: parCategorie?.biere ?? 0 },
      { categorie: 'emballage', libelle: 'Emballage', nombre: parCategorie?.emballage ?? 0 },
      { categorie: 'jus', libelle: 'Jus', nombre: parCategorie?.jus ?? 0 },
    ];
  });

  quantiteMaxFacturee = computed<number>(() => {
    const top = this.statistiques()?.top_boissons ?? [];
    return top.length > 0 ? Math.max(...top.map((b) => b.quantite_facturee)) : 0;
  });

  montantMaxClient = computed<number>(() => {
    const top = this.statistiquesClients()?.top_clients ?? [];
    return top.length > 0 ? Math.max(...top.map((c) => c.montant_total)) : 0;
  });

  constructor(
    private produitService: ProduitService,
    private facturationService: FacturationService
  ) {}

  ngOnInit(): void {
    this.produitService.getStatistiques().subscribe({
      next: (data) => {
        this.statistiques.set(data);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Erreur de chargement des statistiques.');
        this.chargement.set(false);
      },
    });

    this.facturationService.getStatistiquesClients().subscribe({
      next: (data) => {
        this.statistiquesClients.set(data);
        this.chargementClients.set(false);
      },
      error: () => this.chargementClients.set(false),
    });
  }

  largeurBarre(quantite: number): number {
    const max = this.quantiteMaxFacturee();
    return max > 0 ? Math.round((quantite / max) * 100) : 0;
  }

  largeurBarreClient(montant: number): number {
    const max = this.montantMaxClient();
    return max > 0 ? Math.round((montant / max) * 100) : 0;
  }
}