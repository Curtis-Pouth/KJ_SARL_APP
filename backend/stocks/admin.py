from django.contrib import admin

from .models import BonStock, LigneBonStock, Produit

admin.site.register(Produit)
admin.site.register(BonStock)
admin.site.register(LigneBonStock)
