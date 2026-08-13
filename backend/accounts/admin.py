from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Administrateur, Client, CodeReinitialisation, Comptable, Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Rôle KJ SARL', {'fields': ('role',)}),
    )


admin.site.register(Comptable)
admin.site.register(Administrateur)
admin.site.register(Client)
admin.site.register(CodeReinitialisation)
