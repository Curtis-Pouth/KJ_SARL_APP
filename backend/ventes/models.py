from decimal import Decimal

from django.conf import settings
from django.db import models

from stocks.models import Produit


class Commande(models.Model):
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        VALIDEE = 'validee', 'Validee'
        ANNULEE = 'annulee', 'Annulee'

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='commandes'
    )
    date_commande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=50, choices=Statut.choices, default=Statut.EN_ATTENTE)
    produits = models.ManyToManyField(Produit, through='LigneCommande')

    def calculer_total(self):
        return sum(l.quantite * l.produit.prix_unitaire for l in self.lignecommande_set.all())

    def valider_commande(self):
        self.statut = self.Statut.VALIDEE
        self.save()

    def __str__(self):
        return f"Commande #{self.id} ({self.get_statut_display()})"


class LigneCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField()


class Facture(models.Model):
    RISTOURNE_POURCENTAGE = Decimal('0.02')  # 2%, fixe

    commande = models.OneToOneField(Commande, on_delete=models.CASCADE, related_name='facture')
    date_facture = models.DateTimeField(auto_now_add=True)

    montant_ht = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ristourne = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # TTC net de ristourne

    montant_mtn = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_orange = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_caisse = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Facture #{self.id} - {self.montant_total}"