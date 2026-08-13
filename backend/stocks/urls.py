from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BonStockViewSet, CreerBonCommandeView, ProduitViewSet, StatistiquesProduitsView

router = DefaultRouter()
router.register('produits', ProduitViewSet, basename='produit')
router.register('bons-stock', BonStockViewSet, basename='bonstock')

urlpatterns = [
    path('produits/statistiques/', StatistiquesProduitsView.as_view(), name='produits-statistiques'),
    path('bons-stock/creer/', CreerBonCommandeView.as_view(), name='bons-stock-creer'),
] + router.urls