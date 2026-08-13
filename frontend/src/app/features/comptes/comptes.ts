import { Component, OnInit, signal } from '@angular/core';
import { CompteEntreprise } from '../../core/models/compte-entreprise';
import { CompteEntrepriseService } from '../../core/services/compte-entreprise';

@Component({
  selector: 'app-comptes',
  imports: [],
  templateUrl: './comptes.html',
  styleUrl: './comptes.css',
})
export class Comptes implements OnInit {
  comptes = signal<CompteEntreprise[]>([]);
  chargement = signal(true);
  erreur = signal('');

  constructor(private compteEntrepriseService: CompteEntrepriseService) {}

  ngOnInit(): void {
    this.compteEntrepriseService.getAll().subscribe({
      next: (data) => {
        this.comptes.set(data);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Erreur de chargement des comptes.');
        this.chargement.set(false);
      },
    });
  }

  icone(nom: string): string {
    switch (nom) {
      case 'MTN': return 'MTN';
      case 'ORANGE': return 'OM';
      case 'CAISSE': return 'C';
      case 'SABC': return 'S';
      default: return '?';
    }
  }
}