from django.contrib import admin

from .models import Commande, Facture, LigneCommande

admin.site.register(Commande)
admin.site.register(LigneCommande)
admin.site.register(Facture)
