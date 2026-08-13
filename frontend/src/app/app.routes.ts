import { Routes } from '@angular/router';
import { Accueil } from './features/accueil/accueil';
import { Catalogue } from './features/catalogue/catalogue';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { RegisterComptable } from './features/register-comptable/register-comptable';
import { PasswordResetRequest } from './features/password-reset-request/password-reset-request';
import { PasswordResetConfirm } from './features/password-reset-confirm/password-reset-confirm';
import { Dashboard } from './features/dashboard/dashboard';
import { Profile } from './features/profile/profile';
import { Contacts } from './features/contacts/contacts';
import { BonCommande } from './features/bon-commande/bon-commande';
import { Facturation } from './features/facturation/facturation';
import { Magasin } from './features/magasin/magasin';
import { Recapitulatif } from './features/recapitulatif/recapitulatif';
import { RecapitulatifCategorie } from './features/recapitulatif-categorie/recapitulatif-categorie';
import { Panier } from './features/panier/panier';
import { Comptes } from './features/comptes/comptes';
import { AppShell } from './shared/layout/app-shell/app-shell';
import { authGuard } from './core/guards/auth-guard';
import { staffGuard } from './core/guards/staff-guard';
import { clientGuard } from './core/guards/client-guard';

export const routes: Routes = [
  { path: '', component: Accueil, pathMatch: 'full' },
  { path: 'catalogue', component: Catalogue },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'password-reset-request', component: PasswordResetRequest },
  { path: 'password-reset-confirm', component: PasswordResetConfirm },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard, canActivate: [staffGuard] },
      { path: 'magasin', component: Magasin, canActivate: [staffGuard] },
      { path: 'recapitulatif', component: Recapitulatif, canActivate: [staffGuard] },
      { path: 'recapitulatif/:categorie', component: RecapitulatifCategorie, canActivate: [staffGuard] },
      { path: 'contacts', component: Contacts, canActivate: [staffGuard] },
      { path: 'bon-commande', component: BonCommande, canActivate: [staffGuard] },
      { path: 'facturation', component: Facturation, canActivate: [staffGuard] },
      { path: 'comptes', component: Comptes, canActivate: [staffGuard] },
      { path: 'register-comptable', component: RegisterComptable, canActivate: [staffGuard] },
      { path: 'profile', component: Profile },
{ path: 'panier', component: Panier, canActivate: [clientGuard] },    ],
  },
  { path: '**', redirectTo: '' },
];