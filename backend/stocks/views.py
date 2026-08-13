from django.db.models import Sum
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import EstComptableOuAdministrateur

from .models import BonStock, Produit
from .serializers import BonStockSerializer, CreerBonCommandeSerializer, ProduitSerializer


class ProduitViewSet(viewsets.ModelViewSet):
    """Le catalogue (liste + detail) est public ; l'ecriture reste reservee
    au personnel comptable/administrateur."""

    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), EstComptableOuAdministrateur()]


class BonStockViewSet(viewsets.ModelViewSet):
    queryset = BonStock.objects.all()
    serializer_class = BonStockSerializer
    permission_classes = [permissions.IsAuthenticated, EstComptableOuAdministrateur]


class CreerBonCommandeView(APIView):
    """POST /api/bons-stock/creer/ - bon de commande (achat fournisseur SABC) :
    augmente le stock, debite MTN/Orange/Caisse, credite SABC. Renvoie une
    liste d'alertes si un produit repasse sous le seuil de 50 unites."""

    permission_classes = [permissions.IsAuthenticated, EstComptableOuAdministrateur]

    def post(self, request):
        serializer = CreerBonCommandeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bon = serializer.save()

        return Response(
            {
                **BonStockSerializer(bon).data,
                "alertes_stock_faible": getattr(bon, '_produits_stock_faible', []),
            },
            status=status.HTTP_201_CREATED,
        )


class StatistiquesProduitsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from ventes.models import LigneCommande

        par_categorie = {
            categorie: Produit.objects.filter(categorie=categorie).count()
            for categorie, _ in Produit.Categorie.choices
        }

        lignes_facturees = (
            LigneCommande.objects.filter(
                commande__facture__isnull=False,
                produit__categorie__in=[
                    Produit.Categorie.EAU,
                    Produit.Categorie.BIERE,
                    Produit.Categorie.JUS,
                ],
            )
            .values('produit__libelle')
            .annotate(quantite_facturee=Sum('quantite'))
            .order_by('-quantite_facturee')[:5]
        )

        top_boissons = [
            {"libelle": ligne['produit__libelle'], "quantite_facturee": ligne['quantite_facturee']}
            for ligne in lignes_facturees
        ]

        return Response({"par_categorie": par_categorie, "top_boissons": top_boissons})