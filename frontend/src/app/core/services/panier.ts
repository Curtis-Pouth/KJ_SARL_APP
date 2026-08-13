import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LignePanier } from '../models/panier';
import { Produit } from '../models/produit';

const PANIER_KEY = 'kj_sarl_panier';

function chargerPanierDepuisStockage(): LignePanier[] {
  try {
    const brut = localStorage.getItem(PANIER_KEY);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class PanierService {
  private apiUrl = environment.apiUrl;

  readonly lignes = signal<LignePanier[]>(chargerPanierDepuisStockage());

  readonly nombreArticles = computed(() =>
    this.lignes().reduce((total, ligne) => total + ligne.quantite, 0)
  );

  readonly total = computed(() =>
    this.lignes().reduce((total, ligne) => total + ligne.produit.prix_unitaire * ligne.quantite, 0)
  );

  constructor(private http: HttpClient) {}

  private sauvegarder(lignes: LignePanier[]): void {
    this.lignes.set(lignes);
    localStorage.setItem(PANIER_KEY, JSON.stringify(lignes));
  }

  ajouter(produit: Produit, quantite = 1): void {
    const lignes = [...this.lignes()];
    const existante = lignes.find((l) => l.produit.id === produit.id);

    if (existante) {
      existante.quantite += quantite;
    } else {
      lignes.push({ produit, quantite });
    }

    this.sauvegarder(lignes);
  }

  modifierQuantite(produitId: number, quantite: number): void {
    if (quantite <= 0) {
      this.retirer(produitId);
      return;
    }
    const lignes = this.lignes().map((l) =>
      l.produit.id === produitId ? { ...l, quantite } : l
    );
    this.sauvegarder(lignes);
  }

  retirer(produitId: number): void {
    this.sauvegarder(this.lignes().filter((l) => l.produit.id !== produitId));
  }

  vider(): void {
    this.sauvegarder([]);
  }

  passerCommande(): Observable<any> {
    const payload = {
      lignes: this.lignes().map((l) => ({ produit: l.produit.id, quantite: l.quantite })),
    };

    return this.http.post(`${this.apiUrl}/commandes/passer/`, payload).pipe(
      tap(() => this.vider())
    );
  }
}