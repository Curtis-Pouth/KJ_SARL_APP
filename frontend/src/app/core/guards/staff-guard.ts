import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** Autorise uniquement les comptables/administrateurs. */
export const staffGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = authService.getRole();

  if (role === 'comptable' || role === 'administrateur') {
    return true;
  }

  if (role === 'client') {
    // Redirection valide : clientGuard acceptera cette destination, pas de boucle.
    router.navigate(['/panier']);
    return false;
  }

  // Role vide/inattendu (ex: superutilisateur cree sans role assigne) :
  // on deconnecte et on renvoie au login plutot que de risquer une boucle
  // de redirection avec clientGuard.
  authService.logout();
  router.navigate(['/login']);
  return false;
};