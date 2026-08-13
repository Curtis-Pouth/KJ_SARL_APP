from rest_framework import serializers

from .models import BonStock, LigneBonStock, Produit


class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = [
            'id', 'reference', 'libelle', 'categorie', 'photo',
            'quantite_en_stock', 'prix_unitaire', 'stock_epuise', 'stock_faible',
        ]

class LigneBonStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneBonStock
        fields = ['id', 'produit', 'quantite']


class BonStockSerializer(serializers.ModelSerializer):
    lignes = LigneBonStockSerializer(source='lignebonstock_set', many=True, read_only=True)

    class Meta:
        model = BonStock
        fields = ['id', 'type_bon', 'date_bon', 'lignes', 'montant_mtn', 'montant_orange', 'montant_caisse']


class LigneAchatSerializer(serializers.Serializer):
    produit = serializers.IntegerField()
    quantite = serializers.IntegerField(min_value=1)


class CreerBonCommandeSerializer(serializers.Serializer):
    """Bon de commande = achat aupres du fournisseur SABC. Augmente le stock,
    debite MTN/Orange/Caisse (repartition libre), credite SABC du montant total."""

    lignes = LigneAchatSerializer(many=True)
    montant_mtn = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_orange = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_caisse = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Aucun produit selectionne.")
        return value

    def validate(self, data):
        produits_verifies = []
        for ligne in data['lignes']:
            try:
                produit = Produit.objects.get(pk=ligne['produit'])
            except Produit.DoesNotExist:
                raise serializers.ValidationError({"lignes": f"Produit {ligne['produit']} introuvable."})
            produits_verifies.append((produit, ligne['quantite']))
        data['produits_verifies'] = produits_verifies
        return data

    def create(self, validated_data):
        from comptes.models import CompteEntreprise

        bon = BonStock.objects.create(
            type_bon=BonStock.TypeBon.ENTREE,
            montant_mtn=validated_data['montant_mtn'],
            montant_orange=validated_data['montant_orange'],
            montant_caisse=validated_data['montant_caisse'],
        )

        produits_stock_faible = []
        for produit, quantite in validated_data['produits_verifies']:
            LigneBonStock.objects.create(bon_stock=bon, produit=produit, quantite=quantite)
            produit.quantite_en_stock += quantite
            produit.save()
            if produit.stock_faible:
                produits_stock_faible.append(produit.libelle)

        CompteEntreprise.obtenir_ou_creer_tous()
        montant_total = bon.montant_total()
        if validated_data['montant_mtn']:
            CompteEntreprise.objects.get(nom=CompteEntreprise.Nom.MTN).debiter(validated_data['montant_mtn'])
        if validated_data['montant_orange']:
            CompteEntreprise.objects.get(nom=CompteEntreprise.Nom.ORANGE).debiter(validated_data['montant_orange'])
        if validated_data['montant_caisse']:
            CompteEntreprise.objects.get(nom=CompteEntreprise.Nom.CAISSE).debiter(validated_data['montant_caisse'])
        if montant_total:
            CompteEntreprise.objects.get(nom=CompteEntreprise.Nom.SABC).crediter(montant_total)

        bon._produits_stock_faible = produits_stock_faible
        return bon