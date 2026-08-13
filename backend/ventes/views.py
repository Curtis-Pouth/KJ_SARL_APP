from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models

from accounts.permissions import EstComptableOuAdministrateur

from .models import Commande, Facture
from .serializers import (
    CommandeSerializer,
    CreerFacturationSerializer,
    FactureSerializer,
    PasserCommandeSerializer,
)


class CommandeViewSet(viewsets.ModelViewSet):
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        utilisateur = self.request.user
        if utilisateur.role == 'client':
            return Commande.objects.filter(client=utilisateur)
        return Commande.objects.all()

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(detail=False, methods=['post'])
    def passer(self, request):
        serializer = PasserCommandeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        return Response(CommandeSerializer(commande).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        commande = self.get_object()
        commande.valider_commande()
        return Response(self.get_serializer(commande).data)


class FactureViewSet(viewsets.ModelViewSet):
    queryset = Facture.objects.all()
    serializer_class = FactureSerializer
    permission_classes = [permissions.IsAuthenticated]


class CreerFacturationView(APIView):
    """POST /api/facturation/creer/ - reserve au personnel : cree une facture
    complete (commande + lignes + facture + credit des comptes) pour un client
    selectionne dans l'interface Facturation."""

    permission_classes = [permissions.IsAuthenticated, EstComptableOuAdministrateur]

    def post(self, request):
        serializer = CreerFacturationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        facture = serializer.save()
        return Response(FactureSerializer(facture).data, status=status.HTTP_201_CREATED)


class StatistiquesClientsView(APIView):
    """GET /api/statistiques-clients/ - classement des clients par montant total
    facture sur le trimestre en cours (90 derniers jours)."""

    permission_classes = [permissions.IsAuthenticated, EstComptableOuAdministrateur]

    def get(self, request):
        from datetime import timedelta

        from django.db.models import Sum
        from django.utils import timezone

        depuis = timezone.now() - timedelta(days=90)

        resultats = (
            Facture.objects.filter(date_facture__gte=depuis)
            .values('commande__client__first_name', 'commande__client_id')
            .annotate(montant_total_facture=Sum('montant_total'))
            .order_by('-montant_total_facture')[:5]
        )

        top_clients = [
            {
                "client": r['commande__client__first_name'] or 'Client',
                "montant_total": str(r['montant_total_facture']),
            }
            for r in resultats
        ]

        return Response({"top_clients": top_clients})
    
class RechercheClientsView(APIView):
    """GET /api/clients/?q=xxx - recherche de clients par nom/email, utilisee
    par la page Facturation (case 'nom du client' avec filtre en direct)."""

    permission_classes = [permissions.IsAuthenticated, EstComptableOuAdministrateur]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        queryset = Utilisateur.objects.filter(role=Utilisateur.Role.CLIENT)

        if q:
            queryset = queryset.filter(
                models.Q(first_name__icontains=q) | models.Q(email__icontains=q)
            )

        queryset = queryset.order_by('first_name')[:20]
        return Response(UtilisateurSerializer(queryset, many=True).data)