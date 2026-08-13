import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** Autorise uniquement les comptes Client (le panier et la commande sont
 * une fonctionnalite reservee aux clients, pas au personnel comptable). */
export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = authService.getRole();

  if (role === 'client') {
    return true;
  }

  if (role === 'comptable' || role === 'administrateur') {
    // Redirection valide : staffGuard acceptera cette destination, pas de boucle.
    router.navigate(['/dashboard']);
    return false;
  }

  // Role vide/inattendu : on deconnecte et on renvoie au login plutot que
  // de risquer une boucle de redirection avec staffGuard.
  authService.logout();
  router.navigate(['/login']);
  return false;
};