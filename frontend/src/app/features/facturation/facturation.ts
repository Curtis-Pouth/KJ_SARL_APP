import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produit } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';
import { ClientRecherche } from '../../core/models/facturation';
import { FacturationService } from '../../core/services/facturation';
import { AppIcon } from '../../shared/components/icon/icon.component';

interface LigneFacture {
  produit: Produit;
  quantite: number;
}

const RISTOURNE_TAUX = 0.02;

@Component({
  selector: 'app-facturation',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIcon],
  templateUrl: './facturation.html',
  styleUrl: './facturation.css',
})
export class Facturation implements OnInit {
  rechercheClient = '';
  clientsTrouves = signal<ClientRecherche[]>([]);
  clientSelectionne = signal<ClientRecherche | null>(null);
  rechercheEnCours = signal(false);

  produits = signal<Produit[]>([]);
  filtreProduit = '';
  chargementProduits = signal(true);

  lignes = signal<LigneFacture[]>([]);

  montantMtn: number | null = null;
  montantOrange: number | null = null;
  montantCaisse: number | null = null;

  chargement = signal(false);
  message = signal('');
  erreur = signal('');

  montantHt = computed(() =>
    this.lignes().reduce((total, l) => total + l.produit.prix_unitaire * l.quantite, 0)
  );

  ristourne = computed(() => Math.round(this.montantHt() * RISTOURNE_TAUX * 100) / 100);

  montantTtc = computed(() => Math.round((this.montantHt() - this.ristourne()) * 100) / 100);

  totalPaiementSaisi = computed(
    () => (this.montantMtn ?? 0) + (this.montantOrange ?? 0) + (this.montantCaisse ?? 0)
  );

  constructor(
    private produitService: ProduitService,
    private facturationService: FacturationService
  ) {}

  ngOnInit(): void {
    this.produitService.getAll().subscribe({
      next: (data) => {
        this.produits.set(data);
        this.chargementProduits.set(false);
      },
      error: () => this.chargementProduits.set(false),
    });
  }

  onRechercheClientChange(): void {
    this.clientSelectionne.set(null);
    const q = this.rechercheClient.trim();

    if (q.length < 1) {
      this.clientsTrouves.set([]);
      return;
    }

    this.rechercheEnCours.set(true);
    this.facturationService.rechercherClients(q).subscribe({
      next: (clients) => {
        this.clientsTrouves.set(clients);
        this.rechercheEnCours.set(false);
      },
      error: () => this.rechercheEnCours.set(false),
    });
  }

  selectionnerClient(client: ClientRecherche): void {
    this.clientSelectionne.set(client);
    this.rechercheClient = client.nom;
    this.clientsTrouves.set([]);
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
    if (produit.stock_epuise) {
      return;
    }
    const lignes = [...this.lignes()];
    const existante = lignes.find((l) => l.produit.id === produit.id);

    if (existante) {
      if (existante.quantite < produit.quantite_en_stock) {
        existante.quantite += 1;
      }
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
    this.lignes.set(
      this.lignes().map((l) => (l.produit.id === produitId ? { ...l, quantite } : l))
    );
  }

  soumettre(): void {
    this.message.set('');
    this.erreur.set('');

    const client = this.clientSelectionne();
    if (!client) {
      this.erreur.set('Merci de sélectionner un client dans la liste.');
      return;
    }
    if (this.lignes().length === 0) {
      this.erreur.set('Merci de sélectionner au moins un produit.');
      return;
    }
    if (this.totalPaiementSaisi() !== this.montantTtc()) {
      this.erreur.set(
        `La somme des montants saisis (${this.totalPaiementSaisi()} FCFA) doit être rigoureusement égale au montant TTC (${this.montantTtc()} FCFA).`
      );
      return;
    }

    this.chargement.set(true);
    this.facturationService
      .creer({
        client_id: client.id,
        lignes: this.lignes().map((l) => ({ produit: l.produit.id, quantite: l.quantite })),
        montant_mtn: this.montantMtn ?? 0,
        montant_orange: this.montantOrange ?? 0,
        montant_caisse: this.montantCaisse ?? 0,
      })
      .subscribe({
        next: () => {
          this.message.set(`Facture créée avec succès pour le client ${client.nom}.`);
          this.reinitialiser();
          this.chargement.set(false);
        },
        error: (err) => {
          const detail =
            err.error?.lignes?.[0] || err.error?.montant_mtn?.[0] || err.error?.client_id?.[0];
          this.erreur.set(detail || "Erreur lors de la création de la facture.");
          this.chargement.set(false);
        },
      });
  }

  private reinitialiser(): void {
    this.rechercheClient = '';
    this.clientSelectionne.set(null);
    this.clientsTrouves.set([]);
    this.lignes.set([]);
    this.montantMtn = null;
    this.montantOrange = null;
    this.montantCaisse = null;
    this.produitService.getAll().subscribe((data) => this.produits.set(data));
  }
}