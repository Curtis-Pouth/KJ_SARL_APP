import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AppIcon } from '../../components/icon/icon.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, RouterLink, AppIcon],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
  dateDuJour = '';
  recherche = '';

  constructor(protected authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.dateDuJour = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!this.authService.currentUser()) {
      this.authService.chargerUtilisateurCourant().subscribe();
    }
  }

  get initialesUtilisateur(): string {
    const utilisateur = this.authService.currentUser();
    const source = utilisateur?.nom?.trim() || utilisateur?.email?.split('@')[0] || 'KJ';
    const morceaux = source.split(/\s+/).filter(Boolean);
    return (morceaux.length > 1 ? morceaux[0][0] + morceaux[1][0] : source.slice(0, 2)).toUpperCase();
  }

  lancerRecherche(): void {
    const terme = this.recherche.trim();
    if (terme) {
      this.router.navigate(['/catalogue'], { queryParams: { recherche: terme } });
    }
  }

  @HostListener('window:keydown', ['$event'])
  raccourciRecherche(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('.app-search input')?.focus();
    }
  }
}
