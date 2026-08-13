export type CategorieProduit = 'eau' | 'biere' | 'emballage' | 'jus';

export interface Produit {
  id: number;
  reference: string | null;
  libelle: string;
  categorie: CategorieProduit;
  photo: string | null;
  quantite_en_stock: number;
  prix_unitaire: number;
  stock_epuise: boolean;
  stock_faible: boolean;
}

export interface StatistiquesProduits {
  par_categorie: Record<CategorieProduit, number>;
  top_boissons: { libelle: string; quantite_facturee: number }[];
}