import uuid

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Administrateur, Client, Comptable, Utilisateur


class RegisterClientSerializer(serializers.Serializer):
    """Inscription publique — accessible à tous, crée uniquement des comptes Client."""

    nom = serializers.CharField()
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True, min_length=8)
    adresse_livraison = serializers.CharField()

    def validate_email(self, value):
        if Utilisateur.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value.lower()

    def create(self, validated_data):
        utilisateur = Utilisateur.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['nom'],
            password=validated_data['mot_de_passe'],
            role=Utilisateur.Role.CLIENT,
        )
        return Client.objects.create(
            utilisateur=utilisateur,
            code_client=f"CLI-{uuid.uuid4().hex[:8].upper()}",
            adresse_livraison=validated_data['adresse_livraison'],
        )


class RegisterComptableSerializer(serializers.Serializer):
    """Inscription protégée — réservée aux comptables/administrateurs déjà connectés."""

    nom = serializers.CharField()
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True, min_length=8)
    matricule = serializers.CharField()

    def validate_email(self, value):
        if Utilisateur.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value.lower()

    def validate_matricule(self, value):
        if Comptable.objects.filter(matricule=value).exists():
            raise serializers.ValidationError("Ce matricule est déjà utilisé.")
        return value

    def create(self, validated_data):
        utilisateur = Utilisateur.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['nom'],
            password=validated_data['mot_de_passe'],
            role=Utilisateur.Role.COMPTABLE,
        )
        return Comptable.objects.create(
            utilisateur=utilisateur,
            matricule=validated_data['matricule'],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True)

    def validate(self, data):
        utilisateur = authenticate(
            username=data['email'].lower(), password=data['mot_de_passe']
        )
        if not utilisateur:
            raise serializers.ValidationError("Identifiants invalides.")
        if not utilisateur.is_active:
            raise serializers.ValidationError("Ce compte a été désactivé.")
        data['utilisateur'] = utilisateur
        return data


class UtilisateurSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='first_name')
    matricule = serializers.SerializerMethodField()
    adresse_livraison = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'nom', 'role', 'matricule', 'adresse_livraison']

    def get_matricule(self, obj):
        return getattr(getattr(obj, 'profil_comptable', None), 'matricule', None)

    def get_adresse_livraison(self, obj):
        return getattr(getattr(obj, 'profil_client', None), 'adresse_livraison', None)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not Utilisateur.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Aucun compte trouvé avec cet email.")
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    nouveau_mot_de_passe = serializers.CharField(write_only=True, min_length=8)


class ChangePasswordSerializer(serializers.Serializer):
    ancien_mot_de_passe = serializers.CharField(write_only=True)
    nouveau_mot_de_passe = serializers.CharField(write_only=True, min_length=8)

    def validate_ancien_mot_de_passe(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value