import random
import string

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class Utilisateur(AbstractUser):
    """Classe abstraite 'Utilisateur' du diagramme, matérialisée via AbstractUser.

    Le champ `role` distingue les 3 acteurs (Comptable, Administrateur, Client) ;
    chaque rôle a en plus un profil dédié en relation OneToOne pour ses attributs
    spécifiques (matricule, niveau d'accès, code client...).
    """

    class Role(models.TextChoices):
        COMPTABLE = 'comptable', 'Comptable'
        ADMINISTRATEUR = 'administrateur', 'Administrateur'
        CLIENT = 'client', 'Client'

    role = models.CharField(max_length=20, choices=Role.choices)
    email = models.EmailField(unique=True)

    # On force le username à toujours être égal à l'email pour éviter toute
    # ambiguïté au login (l'API authentifie exclusivement par email).
    USERNAME_FIELD = 'username'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    def save(self, *args, **kwargs):
        if self.email:
            self.username = self.email
        super().save(*args, **kwargs)


class Comptable(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur, on_delete=models.CASCADE, related_name='profil_comptable'
    )
    matricule = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"Comptable: {self.utilisateur}"


class Administrateur(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur, on_delete=models.CASCADE, related_name='profil_administrateur'
    )
    niveau_acces = models.CharField(max_length=50)

    def __str__(self):
        return f"Administrateur: {self.utilisateur}"


class Client(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur, on_delete=models.CASCADE, related_name='profil_client'
    )
    code_client = models.CharField(max_length=50, unique=True)
    adresse_livraison = models.CharField(max_length=255)

    def __str__(self):
        return f"Client: {self.utilisateur}"


class CodeReinitialisation(models.Model):
    """Gère le flux 'mot de passe oublié' (voir diagramme de séquence)."""

    utilisateur = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, related_name='codes_reinitialisation'
    )
    code = models.CharField(max_length=6)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_expiration = models.DateTimeField()
    utilise = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date_creation']

    @staticmethod
    def generer_code() -> str:
        return ''.join(random.choices(string.digits, k=6))

    def est_valide(self) -> bool:
        return not self.utilise and timezone.now() <= self.date_expiration

    def __str__(self):
        return f"Code pour {self.utilisateur.email} ({'valide' if self.est_valide() else 'expiré'})"
