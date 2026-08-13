export interface LigneAchatPayload {
  produit: number;
  quantite: number;
}

export interface CreerBonCommandePayload {
  lignes: LigneAchatPayload[];
  montant_mtn: number;
  montant_orange: number;
  montant_caisse: number;
}

export interface BonCommandeResultat {
  id: number;
  type_bon: string;
  date_bon: string;
  montant_mtn: number;
  montant_orange: number;
  montant_caisse: number;
  alertes_stock_faible: string[];
}