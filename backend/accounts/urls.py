from django.urls import path

from .views import (
    ChangePasswordView,
    LoginView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterClientView,
    RegisterComptableView,
)

urlpatterns = [
    path('register/', RegisterClientView.as_view(), name='register'),
    path('register-comptable/', RegisterComptableView.as_view(), name='register-comptable'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]