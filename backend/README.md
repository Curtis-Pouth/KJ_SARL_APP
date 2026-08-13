# KJ SARL — Backend Django

API REST pour la gestion des stocks, ventes, contacts et comptes de KJ SARL.

## Stack

- Django 4.2 + Django REST Framework
- Authentification JWT (djangorestframework-simplejwt)
- SQLite en développement

## Installation

```bash
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env            # puis génère une vraie SECRET_KEY (commande ci-dessous)
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

⚠️ Important : ne place jamais ce projet dans un dossier synchronisé par OneDrive/Google Drive
(cela corrompt les venv et node_modules). Utilise Git pour la sauvegarde/versionning à la place.

## Structure des apps

| App | Contenu |
|---|---|
| `accounts` | Utilisateur (Comptable/Administrateur/Client), inscription, connexion, mot de passe oublié |
| `comptes` | Comptes financiers (caisse/banque) |
| `stocks` | Produits, bons de stock |
| `ventes` | Commandes, lignes de commande, factures |
| `contacts` | Répertoire de contacts |

## Endpoints principaux

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/register/` | Inscription d'un comptable (crée aussi un compte caisse à 0) |
| POST | `/api/login/` | Connexion → renvoie `token` (JWT) + `refresh` |
| POST | `/api/token/refresh/` | Rafraîchit le token d'accès |
| GET | `/api/me/` | Utilisateur connecté |
| POST | `/api/password-reset/request/` | Demande un code de réinitialisation par email |
| POST | `/api/password-reset/confirm/` | Confirme le code + change le mot de passe |
| CRUD | `/api/produits/` | Produits |
| CRUD | `/api/bons-stock/` | Bons de stock |
| CRUD | `/api/commandes/` | Commandes (+ action `POST /commandes/{id}/valider/`) |
| CRUD | `/api/factures/` | Factures |
| CRUD | `/api/contacts/` | Contacts |
| CRUD | `/api/comptes/` | Comptes financiers |

Toutes les routes `CRUD` supportent `GET` (liste + détail), `POST`, `PUT`, `PATCH`, `DELETE`.
Toutes les routes sauf `register`, `login` et `password-reset/*` exigent l'en-tête :
```
Authorization: Bearer <token>
```

## Point corrigé par rapport à la version précédente

Le login authentifie désormais **toujours** par email de façon fiable : le modèle
`Utilisateur` force `username = email` à chaque sauvegarde, donc un compte créé via
`createsuperuser` avec un username différent de l'email ne peut plus se produire.
