from django.db import models


class Contact(models.Model):
    nom = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return self.nom
