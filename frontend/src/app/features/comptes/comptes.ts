import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompteEntreprise } from '../../core/models/compte-entreprise';
import { CompteEntrepriseService } from '../../core/services/compte-entreprise';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [CommonModule, AppIcon],
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
    switch (nom?.toUpperCase()) {
      case 'MTN': return 'smartphone';
      case 'ORANGE': return 'smartphone';
      case 'CAISSE': return 'banknote';
      case 'SABC': return 'building';
      default: return 'wallet';
    }
  }

  badgeStyle(nom: string): { bg: string; color: string; border: string } {
    switch (nom?.toUpperCase()) {
      case 'MTN':
        return { bg: 'bg-amber-500/10', color: 'text-amber-700', border: 'border-amber-500/30' };
      case 'ORANGE':
        return { bg: 'bg-orange-500/10', color: 'text-orange-700', border: 'border-orange-500/30' };
      case 'CAISSE':
        return { bg: 'bg-emerald-500/10', color: 'text-emerald-700', border: 'border-emerald-500/30' };
      case 'SABC':
        return { bg: 'bg-sky-500/10', color: 'text-sky-700', border: 'border-sky-500/30' };
      default:
        return { bg: 'bg-slate-100', color: 'text-slate-700', border: 'border-slate-200' };
    }
  }
}