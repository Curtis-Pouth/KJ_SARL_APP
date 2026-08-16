import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produit } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';
import { BonCommandeService } from '../../core/services/bon-commande-service';
import { AppIcon } from '../../shared/components/icon/icon.component';

interface LigneAchat {
  produit: Produit;
  quantite: number;
}

@Component({
  selector: 'app-bon-commande',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIcon],
  templateUrl: './bon-commande.html',
  styleUrl: './bon-commande.css',
})
export class BonCommande implements OnInit {
  produits = signal<Produit[]>([]);
  filtreProduit = '';
  chargementProduits = signal(true);

  lignes = signal<LigneAchat[]>([]);

  montantMtn: number | null = null;
  montantOrange: number | null = null;
  montantCaisse: number | null = null;

  chargement = signal(false);
  message = signal('');
  erreur = signal('');
  alertesStockFaible = signal<string[]>([]);

  montantTotal = computed(() => (this.montantMtn ?? 0) + (this.montantOrange ?? 0) + (this.montantCaisse ?? 0));

  constructor(
    private produitService: ProduitService,
    private bonCommandeService: BonCommandeService
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  private chargerProduits(): void {
    this.produitService.getAll().subscribe({
      next: (data) => {
        this.produits.set(data);
        this.chargementProduits.set(false);
      },
      error: () => this.chargementProduits.set(false),
    });
  }

  produitsFiltres(): Produit[] {
    const filtre = this.filtreProduit.trim().toLowerCase();
    if (!filtre) {
      return this.produits();
    }
    return this.produits().filter((p) => p.libelle.toLowerCase().includes(filtre));
  }

  quantiteDansLignes(produitId: number): number {
    return this.lignes().find((l) => l.produit.id === produitId)?.quantite ?? 0;
  }

  ajouterLigne(produit: Produit): void {
    const lignes = [...this.lignes()];
    const existante = lignes.find((l) => l.produit.id === produit.id);

    if (existante) {
      existante.quantite += 1;
    } else {
      lignes.push({ produit, quantite: 1 });
    }
    this.lignes.set(lignes);
  }

  retirerLigne(produitId: number): void {
    this.lignes.set(this.lignes().filter((l) => l.produit.id !== produitId));
  }

  modifierQuantiteLigne(produitId: number, quantite: number): void {
    if (quantite <= 0) {
      this.retirerLigne(produitId);
      return;
    }
    this.lignes.set(this.lignes().map((l) => (l.produit.id === produitId ? { ...l, quantite } : l)));
  }

  soumettre(): void {
    this.message.set('');
    this.erreur.set('');
    this.alertesStockFaible.set([]);

    if (this.lignes().length === 0) {
      this.erreur.set('Merci de sélectionner au moins un produit à commander.');
      return;
    }

    this.chargement.set(true);
    this.bonCommandeService
      .creer({
        lignes: this.lignes().map((l) => ({ produit: l.produit.id, quantite: l.quantite })),
        montant_mtn: this.montantMtn ?? 0,
        montant_orange: this.montantOrange ?? 0,
        montant_caisse: this.montantCaisse ?? 0,
      })
      .subscribe({
        next: (resultat) => {
          this.message.set('Bon de commande enregistré avec succès. Le stock a été mis à jour.');
          this.alertesStockFaible.set(resultat.alertes_stock_faible ?? []);
          this.reinitialiser();
          this.chargement.set(false);
        },
        error: (err) => {
          const detail = err.error?.lignes?.[0];
          this.erreur.set(detail || "Erreur lors de l'enregistrement du bon de commande.");
          this.chargement.set(false);
        },
      });
  }

  private reinitialiser(): void {
    this.lignes.set([]);
    this.montantMtn = null;
    this.montantOrange = null;
    this.montantCaisse = null;
    this.chargerProduits();
  }
}