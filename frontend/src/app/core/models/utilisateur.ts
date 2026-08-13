export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: 'comptable' | 'administrateur' | 'client' | string;
  matricule?: string | null;
  adresse_livraison?: string | null;
}

export interface LoginResponse {
  token: string;
  refresh: string;
  role: string;
  utilisateur: Utilisateur;
}

export interface LoginPayload {
  email: string;
  mot_de_passe: string;
}

export interface RegisterClientPayload {
  nom: string;
  email: string;
  mot_de_passe: string;
  adresse_livraison: string;
}

export interface RegisterComptablePayload {
  nom: string;
  email: string;
  mot_de_passe: string;
  matricule: string;
}