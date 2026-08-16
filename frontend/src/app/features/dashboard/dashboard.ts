import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategorieProduit, StatistiquesProduits } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';
import { StatistiquesClients } from '../../core/models/facturation';
import { FacturationService } from '../../core/services/facturation';
import { AppIcon } from '../../shared/components/icon/icon.component';

export interface CarteCategorie {
  categorie: CategorieProduit;
  libelle: string;
  nombre: number;
  icon: string;
  colorClass: string;
  bgClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIcon],
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
      {
        categorie: 'biere',
        libelle: 'Bières & Brassins',
        nombre: parCategorie?.biere ?? 0,
        icon: 'beer',
        colorClass: 'text-amber-600',
        bgClass: 'bg-amber-500/10 border-amber-500/20'
      },
      {
        categorie: 'jus',
        libelle: 'Jus & Soft Drinks',
        nombre: parCategorie?.jus ?? 0,
        icon: 'cup-soda',
        colorClass: 'text-rose-600',
        bgClass: 'bg-rose-500/10 border-rose-500/20'
      },
      {
        categorie: 'eau',
        libelle: 'Eaux Minérales',
        nombre: parCategorie?.eau ?? 0,
        icon: 'droplet',
        colorClass: 'text-sky-600',
        bgClass: 'bg-sky-500/10 border-sky-500/20'
      },
      {
        categorie: 'emballage',
        libelle: 'Emballages & Casiers',
        nombre: parCategorie?.emballage ?? 0,
        icon: 'package',
        colorClass: 'text-indigo-600',
        bgClass: 'bg-indigo-500/10 border-indigo-500/20'
      },
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
