from django.contrib import admin

from .models import Compte, CompteEntreprise

admin.site.register(Compte)
admin.site.register(CompteEntreprise)