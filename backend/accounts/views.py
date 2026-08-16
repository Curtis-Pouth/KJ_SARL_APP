from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from comptes.models import Compte

from .models import CodeReinitialisation, Utilisateur
from .permissions import EstComptableOuAdministrateur
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterClientSerializer,
    RegisterComptableSerializer,
    UtilisateurSerializer,
)


class RegisterClientView(APIView):
    """POST /api/register/ — inscription publique, réservée aux clients."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterClientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()

        return Response(
            {
                "utilisateur": {
                    "id": client.utilisateur.id,
                    "nom": client.utilisateur.first_name,
                    "email": client.utilisateur.email,
                    "code_client": client.code_client,
                    "adresse_livraison": client.adresse_livraison,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class RegisterComptableView(APIView):
    """POST /api/register-comptable/ — réservée au personnel déjà connecté
    (Comptable ou Administrateur) : création d'un nouveau compte Comptable."""

    permission_classes = [permissions.IsAuthenticated, EstComptableOuAdministrateur]

    def post(self, request):
        serializer = RegisterComptableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comptable = serializer.save()

        compte = Compte.objects.create(
            utilisateur=comptable.utilisateur,
            solde=0,
            type_compte='Caisse',
        )

        return Response(
            {
                "utilisateur": {
                    "id": comptable.utilisateur.id,
                    "nom": comptable.utilisateur.first_name,
                    "email": comptable.utilisateur.email,
                    "matricule": comptable.matricule,
                },
                "compte": {
                    "id": compte.id,
                    "solde": str(compte.solde),
                    "type_compte": compte.type_compte,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/login/"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": "Identifiants invalides."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        utilisateur = serializer.validated_data['utilisateur']
        refresh = RefreshToken.for_user(utilisateur)

        role = utilisateur.role or (
            Utilisateur.Role.ADMINISTRATEUR if utilisateur.is_superuser else ''
        )

        return Response(
            {
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "role": role,
                "utilisateur": UtilisateurSerializer(utilisateur).data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """GET /api/me/ — renvoie l'utilisateur connecté."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UtilisateurSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """POST /api/password-reset/request/"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": "Compte introuvable."}, status=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data['email']
        utilisateur = Utilisateur.objects.get(email__iexact=email)

        code = CodeReinitialisation.generer_code()
        CodeReinitialisation.objects.create(
            utilisateur=utilisateur,
            code=code,
            date_expiration=timezone.now() + timedelta(minutes=15),
        )

        send_mail(
            subject="Votre code de réinitialisation - KJ SARL",
            message=f"Votre code de réinitialisation est : {code} (valable 15 minutes).",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        return Response(
            {"detail": "Code envoyé, vérifiez votre email."}, status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """POST /api/password-reset/confirm/"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            utilisateur = Utilisateur.objects.get(email__iexact=data['email'])
            code_obj = CodeReinitialisation.objects.filter(
                utilisateur=utilisateur, code=data['code']
            ).latest('date_creation')
        except (Utilisateur.DoesNotExist, CodeReinitialisation.DoesNotExist):
            return Response(
                {"detail": "Code invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not code_obj.est_valide():
            return Response(
                {"detail": "Code invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        utilisateur.set_password(data['nouveau_mot_de_passe'])
        utilisateur.save()
        code_obj.utilise = True
        code_obj.save()

        return Response(
            {"detail": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK
        )


class ChangePasswordView(APIView):
    """PATCH /api/change-password/ — pour un utilisateur déjà connecté (page profil)."""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['nouveau_mot_de_passe'])
        request.user.save()

        return Response(
            {"detail": "Mot de passe changé avec succès."}, status=status.HTTP_200_OK
        )
