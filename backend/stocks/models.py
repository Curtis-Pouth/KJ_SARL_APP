from django.db import models

SEUIL_ALERTE_STOCK = 50


class Produit(models.Model):
    class Categorie(models.TextChoices):
        EAU = 'eau', 'Eau'
        BIERE = 'biere', 'Biere'
        EMBALLAGE = 'emballage', 'Emballage'
        JUS = 'jus', 'Jus'

    reference = models.CharField(max_length=30, unique=True, blank=True, null=True)
    libelle = models.CharField(max_length=255)
    categorie = models.CharField(max_length=20, choices=Categorie.choices, default=Categorie.EAU)
    quantite_en_stock = models.PositiveIntegerField(default=0)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    photo = models.ImageField(upload_to='produits/', blank=True, null=True)
    def mettre_a_jour_stock(self, quantite):
        self.quantite_en_stock += quantite
        self.save()

    @property
    def stock_epuise(self):
        return self.quantite_en_stock == 0

    @property
    def stock_faible(self):
        return 0 < self.quantite_en_stock < SEUIL_ALERTE_STOCK

    def __str__(self):
        return self.libelle


class BonStock(models.Model):
    """Un bon d'entree correspond a un achat aupres du fournisseur SABC :
    il augmente le stock des produits concernes et debite les comptes
    MTN/Orange/Caisse pour crediter le compte SABC du montant total paye."""

    class TypeBon(models.TextChoices):
        ENTREE = 'entree', 'Entree'
        SORTIE = 'sortie', 'Sortie'

    type_bon = models.CharField(max_length=10, choices=TypeBon.choices, default=TypeBon.ENTREE)
    date_bon = models.DateTimeField(auto_now_add=True)
    produits = models.ManyToManyField(Produit, through='LigneBonStock')

    montant_mtn = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_orange = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_caisse = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def montant_total(self):
        return self.montant_mtn + self.montant_orange + self.montant_caisse

    def __str__(self):
        return f"Bon {self.get_type_bon_display()} du {self.date_bon:%d/%m/%Y}"


class LigneBonStock(models.Model):
    bon_stock = models.ForeignKey(BonStock, on_delete=models.CASCADE)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField()