from decimal import Decimal

from rest_framework import serializers

from comptes.models import CompteEntreprise
from stocks.models import Produit

from .models import Commande, Facture, LigneCommande


class LigneCommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneCommande
        fields = ['id', 'produit', 'quantite']


class CommandeSerializer(serializers.ModelSerializer):
    lignes = LigneCommandeSerializer(source='lignecommande_set', many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = ['id', 'client', 'date_commande', 'statut', 'lignes', 'total']
        read_only_fields = ['client']

    def get_total(self, obj):
        return str(obj.calculer_total())


class LignePanierSerializer(serializers.Serializer):
    produit = serializers.IntegerField()
    quantite = serializers.IntegerField(min_value=1)


class PasserCommandeSerializer(serializers.Serializer):
    """Utilise par la page publique Panier (client qui commande pour lui-meme)."""

    lignes = LignePanierSerializer(many=True)

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Le panier est vide.")
        return value

    def create(self, validated_data):
        client = self.context['request'].user
        commande = Commande.objects.create(client=client)

        for ligne in validated_data['lignes']:
            produit = Produit.objects.get(pk=ligne['produit'])
            LigneCommande.objects.create(
                commande=commande, produit=produit, quantite=ligne['quantite']
            )

        return commande


class FactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = [
            'id', 'commande', 'date_facture', 'montant_ht', 'ristourne',
            'montant_total', 'montant_mtn', 'montant_orange', 'montant_caisse',
        ]


class CreerFacturationSerializer(serializers.Serializer):
    """Utilise par la page Facturation (comptable qui facture un client) :
    cree Commande + LigneCommande + Facture en une seule requete, decompte
    le stock, verifie que la repartition MTN/Orange/Caisse couvre bien le
    montant TTC (net de ristourne), et credite les comptes correspondants."""

    client_id = serializers.IntegerField()
    lignes = LignePanierSerializer(many=True)
    montant_mtn = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_orange = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_caisse = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Aucun produit selectionne.")
        return value

    def validate(self, data):
        from accounts.models import Utilisateur

        try:
            client = Utilisateur.objects.get(pk=data['client_id'], role=Utilisateur.Role.CLIENT)
        except Utilisateur.DoesNotExist:
            raise serializers.ValidationError({"client_id": "Client introuvable."})
        data['client'] = client

        montant_ht = Decimal('0')
        produits_verifies = []
        for ligne in data['lignes']:
            try:
                produit = Produit.objects.get(pk=ligne['produit'])
            except Produit.DoesNotExist:
                raise serializers.ValidationError({"lignes": f"Produit {ligne['produit']} introuvable."})

            if produit.quantite_en_stock < ligne['quantite']:
                raise serializers.ValidationError({
                    "lignes": f"Stock insuffisant pour {produit.libelle} "
                              f"(disponible : {produit.quantite_en_stock})."
                })

            montant_ht += produit.prix_unitaire * ligne['quantite']
            produits_verifies.append((produit, ligne['quantite']))

        ristourne = (montant_ht * Facture.RISTOURNE_POURCENTAGE).quantize(Decimal('0.01'))
        montant_ttc = montant_ht - ristourne

        total_paiement = data['montant_mtn'] + data['montant_orange'] + data['montant_caisse']
        if total_paiement != montant_ttc:
            raise serializers.ValidationError({
                "montant_mtn": f"La somme des montants payes ({total_paiement}) doit "
                               f"correspondre exactement au montant TTC ({montant_ttc})."
            })

        data['produits_verifies'] = produits_verifies
        data['montant_ht'] = montant_ht
        data['ristourne'] = ristourne
        data['montant_ttc'] = montant_ttc
        return data

    def create(self, validated_data):
        commande = Commande.objects.create(
            client=validated_data['client'], statut=Commande.Statut.VALIDEE
        )

        for produit, quantite in validated_data['produits_verifies']:
            LigneCommande.objects.create(commande=commande, produit=produit, quantite=quantite)
            produit.quantite_en_stock -= quantite
            produit.save()

        facture = Facture.objects.create(
            commande=commande,
            montant_ht=validated_data['montant_ht'],
            ristourne=validated_data['ristourne'],
            montant_total=validated_data['montant_ttc'],
            montant_mtn=validated_data['montant_mtn'],
            montant_orange=validated_data['montant_orange'],
            montant_caisse=validated_data['montant_caisse'],
        )

        CompteEntreprise.obtenir_ou_creer_tous()
        if validated_data['montant_mtn']:
            CompteEntreprise.objects.get(nom=CompteEntreprise.Nom.MTN).crediter(validated_data['montant_mtn'])
        if validated_data['montant_orange']:
            CompteEntreprise.objects.get(nom=CompteEntreprise.Nom.ORANGE).crediter(validated_data['montant_orange'])
        if validated_data['montant_caisse']:
            CompteEntreprise.objects.get(nom=CompteEntreprise.Nom.CAISSE).crediter(validated_data['montant_caisse'])

        return facture