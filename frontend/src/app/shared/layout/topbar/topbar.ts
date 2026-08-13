import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
  dateDuJour = '';

  constructor(protected authService: AuthService) {}

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
}