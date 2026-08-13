from rest_framework.routers import DefaultRouter

from .views import CompteEntrepriseViewSet, CompteViewSet

router = DefaultRouter()
router.register('comptes', CompteViewSet, basename='compte')
router.register('comptes-entreprise', CompteEntrepriseViewSet, basename='compte-entreprise')

urlpatterns = router.urls