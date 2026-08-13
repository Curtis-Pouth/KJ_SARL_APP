# KJ SARL — Frontend Angular

Interface web pour la gestion KJ SARL, connectée à l'API Django.

## Stack

- Angular 20 (composants standalone, signals, control flow `@if`/`@for`)
- Tailwind CSS v4
- Authentification JWT (intercepteur + guard)

## Installation

```bash
npm install
ng serve
```

Ouvre `http://localhost:4200`.

⚠️ Ne place jamais ce projet dans un dossier synchronisé par OneDrive/Google Drive —
cela corrompt régulièrement `node_modules` (binaires natifs de Tailwind notamment)
et cause des erreurs difficiles à diagnostiquer. Utilise Git pour le versionning.

## Configuration de l'API

L'URL de l'API backend se règle dans :
- `src/environments/environment.development.ts` (mode `ng serve`)
- `src/environments/environment.ts` (mode production, `ng build`)

Par défaut : `http://127.0.0.1:8000/api`.

## Structure

```
src/app/
├── core/
│   ├── services/       auth.ts, produit.ts
│   ├── interceptors/   jwt-interceptor.ts (ajoute le Bearer token automatiquement)
│   ├── guards/         auth-guard.ts (protège /dashboard)
│   └── models/         utilisateur.ts, produit.ts
├── features/
│   ├── login/
│   ├── register/
│   ├── password-reset-request/
│   ├── password-reset-confirm/
│   └── dashboard/
├── app.routes.ts
├── app.config.ts
└── app.ts
```

## Logo

Place ton fichier logo dans `public/logo-kj-sarl.png` — il sera automatiquement
servi à la racine et affiché sur la page de connexion (s'il est absent, l'image
disparaît silencieusement au lieu de casser l'affichage).

## Build de production

```bash
ng build
```

Les fichiers sont générés dans `dist/frontend/browser/`.

## Ce qui a été corrigé par rapport à la version précédente

- Tailwind v4 vérifié fonctionnel par un build réel (plus de classes non compilées)
- Convention de nommage 100% cohérente avec Angular CLI 20 (`login.ts` / classe `Login`, etc.) — plus de décalage entre fichiers générés et code fourni
- `AuthService` expose un `signal` `isLoggedIn` réactif, utilisé par le guard
- Gestion d'erreurs affinée sur le formulaire d'inscription (email/matricule/mot de passe déjà pris)
- États de chargement (`chargement()`) sur tous les formulaires pour éviter les double-soumissions
