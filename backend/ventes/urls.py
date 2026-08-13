from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CommandeViewSet, CreerFacturationView, FactureViewSet, StatistiquesClientsView

router = DefaultRouter()
router.register('commandes', CommandeViewSet, basename='commande')
router.register('factures', FactureViewSet, basename='facture')

urlpatterns = [
    path('facturation/creer/', CreerFacturationView.as_view(), name='facturation-creer'),
    path('statistiques-clients/', StatistiquesClientsView.as_view(), name='statistiques-clients'),
] + router.urls