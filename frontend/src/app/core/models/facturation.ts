export interface ClientRecherche {
  id: number;
  nom: string;
  email: string;
}

export interface LigneFacturationPayload {
  produit: number;
  quantite: number;
}

export interface CreerFacturationPayload {
  client_id: number;
  lignes: LigneFacturationPayload[];
  montant_mtn: number;
  montant_orange: number;
  montant_caisse: number;
}

export interface Facture {
  id: number;
  commande: number;
  date_facture: string;
  montant_ht: number;
  ristourne: number;
  montant_total: number;
  montant_mtn: number;
  montant_orange: number;
  montant_caisse: number;
}

export interface StatistiquesClients {
  top_clients: { client: string; montant_total: number }[];
}