import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AppIcon } from '../../components/icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppIcon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(private authService: AuthService, private router: Router) {}

  get initialesUtilisateur(): string {
    const utilisateur = this.authService.currentUser();
    const source = utilisateur?.nom?.trim() || utilisateur?.email?.split('@')[0] || 'KJ';
    const morceaux = source.split(/\s+/).filter(Boolean);
    return (morceaux.length > 1 ? morceaux[0][0] + morceaux[1][0] : source.slice(0, 2)).toUpperCase();
  }

  get isClient(): boolean {
    return this.authService.getRole() === 'client';
  }

  get isPro(): boolean {
    const role = this.authService.getRole();
    return role === 'comptable' || role === 'administrateur';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
