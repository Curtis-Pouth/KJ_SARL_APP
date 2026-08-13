export type NomCompteEntreprise = 'MTN' | 'ORANGE' | 'CAISSE' | 'SABC';

export interface CompteEntreprise {
  id: number;
  nom: NomCompteEntreprise;
  nom_affiche: string;
  solde: number;
}