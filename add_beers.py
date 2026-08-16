import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kj_sarl_backend.settings')
django.setup()

from stocks.models import Produit

produits_a_ajouter = [
    {
        'reference': 'B-33EXP',
        'libelle': '33 Export',
        'categorie': 'biere',
        'quantite_en_stock': 120,
        'prix_unitaire': 700.00,
    },
    {
        'reference': 'B-CASTEL',
        'libelle': 'Castel Beer',
        'categorie': 'biere',
        'quantite_en_stock': 150,
        'prix_unitaire': 750.00,
    },
    {
        'reference': 'B-MANYAN',
        'libelle': 'Manyan',
        'categorie': 'biere',
        'quantite_en_stock': 80,
        'prix_unitaire': 600.00,
    },
    {
        'reference': 'B-ISENB',
        'libelle': 'Isenbeck',
        'categorie': 'biere',
        'quantite_en_stock': 100,
        'prix_unitaire': 800.00,
    }
]

for p_data in produits_a_ajouter:
    Produit.objects.update_or_create(
        reference=p_data['reference'],
        defaults=p_data
    )

print("Les 4 bières ont été ajoutées au catalogue avec succès !")
