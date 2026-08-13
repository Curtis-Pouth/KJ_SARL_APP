from django.conf import settings
from django.db import models


class Compte(models.Model):
    """Compte personnel cree automatiquement pour chaque Comptable a l'inscription."""

    class TypeCompte(models.TextChoices):
        CAISSE = 'Caisse', 'Caisse'
        BANQUE = 'Banque', 'Banque'

    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comptes'
    )
    solde = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    type_compte = models.CharField(max_length=50, choices=TypeCompte.choices, default=TypeCompte.CAISSE)

    def debiter_compte(self, montant):
        if montant > self.solde:
            raise ValueError("Solde insuffisant")
        self.solde -= montant
        self.save()

    def obtenir_details(self):
        return {"id": self.id, "solde": str(self.solde), "type_compte": self.type_compte}

    def __str__(self):
        return f"{self.type_compte} - {self.utilisateur} ({self.solde})"


class CompteEntreprise(models.Model):
    """Les 4 comptes globaux de l'entreprise : MTN, Orange, Caisse, SABC.

    - Une facturation (vente a un client) credite MTN/Orange/Caisse selon le
      moyen de paiement utilise par le client.
    - Un bon de commande (achat aupres du fournisseur SABC) debite MTN/Orange/
      Caisse et credite SABC.
    """

    class Nom(models.TextChoices):
        MTN = 'MTN', 'MTN Mobile Money'
        ORANGE = 'ORANGE', 'Orange Money'
        CAISSE = 'CAISSE', 'Caisse'
        SABC = 'SABC', 'SABC (Fournisseur)'

    nom = models.CharField(max_length=20, choices=Nom.choices, unique=True)
    solde = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    def crediter(self, montant):
        self.solde += montant
        self.save()

    def debiter(self, montant):
        self.solde -= montant
        self.save()

    def __str__(self):
        return f"{self.get_nom_display()} : {self.solde}"

    @classmethod
    def obtenir_ou_creer_tous(cls):
        for nom, _ in cls.Nom.choices:
            cls.objects.get_or_create(nom=nom)