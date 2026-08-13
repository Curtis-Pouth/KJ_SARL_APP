import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produit, CategorieProduit } from '../../core/models/produit';
import { ProduitService } from '../../core/services/produit';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogue.html',
  styleUrl: './catalogue.css'
})
export class Catalogue implements OnInit {
  produits = signal<Produit[]>([]);
  chargement = signal<boolean>(true);
  
  termeRecherche = signal<string>('');
  categorieActive = signal<string>('tous');

  // Filtrage combiné (Recherche + Catégorie)
  produitsFiltres = computed(() => {
    const recherche = this.termeRecherche().toLowerCase().trim();
    const cat = this.categorieActive();

    return this.produits().filter(p => {
      const correspondRecherche = p.libelle.toLowerCase().includes(recherche) || 
                                   p.reference.toLowerCase().includes(recherche);
      const correspondCategorie = cat === 'tous' || p.categorie === cat;

      return correspondRecherche && correspondCategorie;
    });
  });

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits.set(data);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false)
    });
  }

  changerCategorie(cat: string): void {
    this.categorieActive.set(cat);
  }

  surRecherche(event: Event): void {
    const valeur = (event.target as HTMLInputElement).value;
    this.termeRecherche.set(valeur);
  }

  uploaderImage(event: Event, produit: Produit): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Exemple de prévisualisation locale instantanée
      const reader = new FileReader();
      reader.onload = (e) => {
        const nouvelleUrl = e.target?.result as string;
        
        // Mise à jour de l'état local du produit
        this.produits.update(liste => 
          liste.map(p => p.reference === produit.reference ? { ...p, image_url: nouvelleUrl } : p)
        );
      };
      reader.readAsDataURL(file);

      // Si vous avez un service Backend pour uploader l'image :
      /*
      const formData = new FormData();
      formData.append('image', file);
      this.produitService.uploadImageProduit(produit.reference, formData).subscribe();
      */
    }
  }
}