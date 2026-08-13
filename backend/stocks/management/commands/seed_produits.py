"""Peuple la base avec le catalogue reel KJ SARL (extrait des fiches d'inventaire).

Usage :
    python manage.py seed_produits
"""

from django.core.management.base import BaseCommand

from stocks.models import Produit


# (reference, designation, categorie, prix_unitaire_fcfa)
CATALOGUE = [
    # --- BG_PET_100 : packs PET 100cl (pack de 6) ---
    ("COK10P", "Pack de 6 Coca-Cola PET 100cl", "jus", 3600),
    ("DAP10P", "Pack Djino Ananas Passion PET 100cl", "jus", 3600),
    ("DJC10P", "Pack 6 D'Jino Cocktail Fruits PET 100cl", "jus", 3600),
    ("DJP10P", "Pack Djino Pamplemousse PET 100cl", "jus", 3600),
    ("DMG10P", "Pack Djino Mangue Goyave PET 100cl", "jus", 3600),
    ("FTO10P", "Pack de 6 Fanta Orange PET 100cl", "jus", 3600),
    ("ORG10P", "Pack 6 Orangina PET 100cl", "jus", 3600),
    ("SPR10P", "Pack Sprite PET 100cl", "jus", 3600),
    ("TPA10P", "Pack Top Ananas PET 100cl", "jus", 3600),
    ("TPB10P", "Pack Top Bitter Lemon PET 100cl", "jus", 3600),
    ("TPG10P", "Pack Top Grenadine PET 100cl", "jus", 3600),
    ("TPO10P", "Pack Top Orange PET 100cl", "jus", 3600),
    ("TPP10P", "Pack Top Pamplemousse PET 100cl", "jus", 3600),
    ("VIM10P", "Pack 6 Vimto PET 100cl", "jus", 3600),
    ("WCO10P", "Pack de 6 World Cola PET 100cl", "jus", 3600),
    ("WCO10PP", "Pack 6 World Cola PET 100cl Promo", "jus", 3400),
    ("YOU10P", "Pack Youzou PET 100cl", "jus", 3600),
    ("YOU10PP", "Pack Youzou PET 100cl Promo", "jus", 3400),

    # --- BG_PET_35 : packs PET 35cl (pack de 12) ---
    ("DAP35P", "Pack Djino Ananas Passion PET 35cl", "jus", 3000),
    ("DJC35P", "Pack 12 D'Jino Cocktail Fruits PET 35cl", "jus", 3000),
    ("DJP35P", "Pack 12 Djino Pamplemousse PET 35cl", "jus", 3000),
    ("ORG35P", "Pack 12 Orangina PET 35cl", "jus", 3000),
    ("TPA35P", "Pack 12 Top Ananas PET 35cl", "jus", 3000),
    ("TPG35P", "Pack 12 Top Grenadine PET 35cl", "jus", 3000),
    ("TPO35P", "Pack 12 Top Orange PET 35cl", "jus", 3000),
    ("TPP35P", "Pack 12 Top Pamplemousse PET 35cl", "jus", 3000),
    ("TPT35P", "Pack Top Tonic PET 35cl", "jus", 3000),
    ("VIM35P", "Pack 12 Vimto PET 35cl", "jus", 3000),
    ("WCO35P", "Pack 12 World Cola PET 35cl", "jus", 3000),
    ("XLO35P", "BG PET 35cl XLO Pack 12", "jus", 3000),
    ("XXL35P", "BG PET 35cl XXL Pack 12", "jus", 3000),
    ("YOU35P", "Pack Youzou PET 35cl", "jus", 3000),

    # --- BG_PM : casiers petit modele 30cl ---
    ("MAT30C", "Casier Malta Tonic 30cl", "jus", 4200),
    ("TPA30C", "Casier Top Ananas 30cl", "jus", 3600),
    ("TPO30C", "Casier Top Orange 30cl", "jus", 3600),
    ("TPT30C", "Casier Top Tonic 30cl", "jus", 3600),
    ("XXL30C", "Casier BG 30cl XXL 24 bouteilles", "jus", 3600),
    ("YOU30C", "Casier Youzou 30cl", "jus", 3600),

    # --- ALCOOL_MIX ---
    ("BGT50C", "Casier Booster Gin Tonic 50cl", "biere", 9500),
    ("BGT65C", "Casier Booster Gin Tonic 65cl", "biere", 10000),
    ("BRA50B", "Booster Racine 50cl (boite)", "biere", 9000),
    ("BRA50C", "Casier Booster Racines 50cl", "biere", 9500),
    ("BRG50C", "Casier Booster Rhum 50cl", "biere", 9500),
    ("BWC50C", "Casier Booster Whisky 50cl", "biere", 9800),
    ("BWC65C", "Casier Booster Whisky 65cl", "biere", 10200),
    ("SDB50C", "Casier Smirnoff Ice Double 50cl", "biere", 10500),
    ("SPP50C50C", "Casier Smirnoff Pineapple 50cl", "biere", 10500),

    # --- BG_GM : casiers grand modele 50/60cl ---
    ("COK60CP", "Casier Coca-Cola 60cl", "jus", 4800),
    ("DAP60C", "Casier Djino Ananas Passion 60cl", "jus", 4800),
    ("DJC60C", "Casier D'Jino Cocktail 60cl", "jus", 4800),
    ("DJP60C", "Casier Djino Pamplemousse 60cl", "jus", 4800),
    ("DMG60C", "Casier Djino Mangue Goyave 60cl", "jus", 4800),
    ("MAT50B", "Malta Tonic boite 50cl", "jus", 9000),
    ("ORG60C", "Casier Orangina 60cl", "jus", 4800),
    ("SOD60C", "Casier Soda Water 60cl", "jus", 4500),
    ("TPA50C", "Casier Top Ananas 50cl", "jus", 4600),
    ("TPA50CP", "Casier Top Ananas Promo 50cl", "jus", 4400),
    ("TPA60C", "Casier Top Ananas 60cl", "jus", 4800),
    ("TPB60C", "Casier Top Bitter Lemon 60cl", "jus", 4800),
    ("TPG50C", "Casier Top Grenadine 50cl", "jus", 4600),
    ("TPG60C", "Casier Top Grenadine 60cl", "jus", 4800),
    ("TPO50C", "Casier Top Orange 50cl", "jus", 4600),
    ("TPO60C", "Casier Top Orange 60cl", "jus", 4800),
    ("TPP50C", "Casier Top Pamplemousse 50cl", "jus", 4600),
    ("TPP60C", "Casier Top Pamplemousse 60cl", "jus", 4800),
    ("TPT50C", "Casier Top Tonic 50cl", "jus", 4600),
    ("VIM60C", "Casier Vimto 60cl", "jus", 4800),
    ("WCO50C", "Casier World Cola 50cl", "jus", 4600),
    ("WCO60C", "Casier World Cola 60cl", "jus", 4800),
    ("YOU50CL", "Casier Youzou 50cl", "jus", 4600),
    ("YOU60C", "Casier Youzou 60cl", "jus", 4800),

    # --- BIERES_BOITE : cartons de bieres en boite 50cl ---
    ("BFL50B", "Carton Beaufort Light boite 50cl", "biere", 9500),
    ("BFT50B", "Carton Beaufort Lager boite 50cl", "biere", 9500),
    ("BWC50B", "Carton Booster Whisky boite 50cl", "biere", 9800),
    ("CAS50B", "Carton Castel boite 50cl", "biere", 9500),
    ("CHC50B", "Carton Chill Citron boite 50cl", "biere", 9000),
    ("DOP50B", "Carton Doppel boite 50cl", "biere", 9500),
    ("EXP33B", "Carton 33 Export boite 33cl", "biere", 8500),
    ("EXP50B", "Carton 33 Export boite 50cl", "biere", 10000),
    ("HEI50B", "Carton Heineken boite 50cl", "biere", 10500),
    ("ISE50B", "Carton Isenbeck boite 50cl", "biere", 9500),
    ("MNY50B", "Carton Manyan boite 50cl", "biere", 9200),
    ("MUT50B", "Carton Mutzig boite 50cl", "biere", 10000),

    # --- BIERES_GM : casiers grand modele 65cl ---
    ("BFL50C", "Casier Beaufort Light 50cl", "biere", 9500),
    ("BFT50C", "Casier Beaufort Lager 50cl", "biere", 9500),
    ("BFTT50C", "Casier Beaufort Tango 50cl", "biere", 9500),
    ("CAS65C", "Casier Castel 65cl", "biere", 9800),
    ("CHC50C", "Casier Chill Citron 50cl", "biere", 9000),
    ("CMS50C", "Casier Castle Milk Stout 50cl", "biere", 9800),
    ("DOB65C", "Casier Doppel Blonde 65cl", "biere", 9500),
    ("DOP65C", "Casier Doppel Munich 65cl", "biere", 9500),
    ("EXP65C", "Casier 33 Export 65cl", "biere", 10000),
    ("ISE65C", "Casier Isenbeck 65cl", "biere", 9800),
    ("JAP65C", "Casier biere des fetes 65cl", "biere", 10500),
    ("MNY65C", "Casier Manyan 65cl", "biere", 9500),
    ("MUT65C", "Casier Mutzig 65cl", "biere", 10200),

    # --- BIERES_PM : casiers petit modele 33cl ---
    ("CAS33C", "Casier Castel 33cl", "biere", 6800),
    ("EXP33C", "Casier 33 Export 33cl", "biere", 6800),
    ("MUT33C", "Casier Mutzig 33cl", "biere", 7000),

    # --- BOITES : cartons XXL ---
    ("XXL33B", "Carton XXL boite 33cl", "biere", 8500),
    ("XXL50B", "Carton XXL boite 50cl", "biere", 9500),

    # --- EAUX_AROMATISEE ---
    ("TCI10P", "Pack Source Tangui aromatisee", "eau", 1800),

    # --- EAUX_NATURELLES ---
    ("TGI05P", "Pack Source Tangui 50cl", "eau", 1200),
    ("TGI10P", "Pack Source Tangui 100cl", "eau", 1800),
    ("TGI15P", "Pack Source Tangui 150cl", "eau", 2200),
    ("TGI18P", "Pack Source Tangui 180cl", "eau", 2500),
    ("TGI33P", "Pack Source Tangui 33cl", "eau", 900),
    ("VIT05P", "Eau Vitale 50cl (pack)", "eau", 1500),
    ("VIT10J", "Bidon eau Vitale 10L", "eau", 2000),
    ("VIT15P", "Eau Vitale 150cl (pack)", "eau", 2800),

    # --- EMBALLAGE ---
    ("CAISMB", "Caisse metallique a bidon", "emballage", 3000),
    ("INPN33", "IN Plast PP 1150x1030 Noir", "emballage", 2500),
    ("PALTPL", "Palette plastique", "emballage", 15000),
    ("PALTV", "Palette bois", "emballage", 5000),
    ("VCP12", "Casier plein 12 trous", "emballage", 1000),
    ("VCP24", "Casier plein 24 trous", "emballage", 1500),
    ("VIP12", "Casier vide 12 trous", "emballage", 800),
    ("VIP24", "Casier vide 24 trous", "emballage", 1200),

    # --- HEINEKEN ---
    ("HEI33V", "Carton Heineken bouteilles 33cl", "biere", 8500),
]


class Command(BaseCommand):
    help = "Peuple la base avec le catalogue reel KJ SARL (produits + prix)."

    def handle(self, *args, **options):
        crees = 0
        mis_a_jour = 0

        for reference, libelle, categorie, prix in CATALOGUE:
            produit, cree = Produit.objects.get_or_create(
                reference=reference,
                defaults={
                    "libelle": libelle,
                    "categorie": categorie,
                    "prix_unitaire": prix,
                    "quantite_en_stock": 100,
                },
            )
            if cree:
                crees += 1
            else:
                produit.libelle = libelle
                produit.categorie = categorie
                produit.prix_unitaire = prix
                produit.save()
                mis_a_jour += 1

        self.stdout.write(self.style.SUCCESS(
            f"Catalogue KJ SARL : {crees} produit(s) cree(s), {mis_a_jour} mis a jour."
        ))