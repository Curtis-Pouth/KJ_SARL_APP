from rest_framework.permissions import BasePermission

from .models import Utilisateur


class EstComptableOuAdministrateur(BasePermission):
    """Autorise uniquement les utilisateurs connectés ayant le rôle
    Comptable ou Administrateur (utilisé pour protéger la création
    de nouveaux comptes Comptable, réservée au personnel interne)."""

    message = "Seuls les comptables et administrateurs peuvent effectuer cette action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (Utilisateur.Role.COMPTABLE, Utilisateur.Role.ADMINISTRATEUR)
        )