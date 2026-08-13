from rest_framework import serializers

from .models import Compte, CompteEntreprise


class CompteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compte
        fields = ['id', 'utilisateur', 'solde', 'type_compte']
        read_only_fields = ['id']


class CompteEntrepriseSerializer(serializers.ModelSerializer):
    nom_affiche = serializers.CharField(source='get_nom_display', read_only=True)

    class Meta:
        model = CompteEntreprise
        fields = ['id', 'nom', 'nom_affiche', 'solde']