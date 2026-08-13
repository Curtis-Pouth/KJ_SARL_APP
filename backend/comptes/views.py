from rest_framework import permissions, viewsets

from accounts.permissions import EstComptableOuAdministrateur

from .models import Compte, CompteEntreprise
from .serializers import CompteEntrepriseSerializer, CompteSerializer


class CompteViewSet(viewsets.ModelViewSet):
    queryset = Compte.objects.all()
    serializer_class = CompteSerializer
    permission_classes = [permissions.IsAuthenticated]


class CompteEntrepriseViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/comptes-entreprise/ - liste des 4 comptes MTN/Orange/Caisse/SABC."""

    serializer_class = CompteEntrepriseSerializer
    permission_classes = [permissions.IsAuthenticated, EstComptableOuAdministrateur]

    def get_queryset(self):
        CompteEntreprise.obtenir_ou_creer_tous()
        return CompteEntreprise.objects.all().order_by('nom')