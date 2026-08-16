import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppIcon } from '../../shared/components/icon/icon.component';
import { ProduitService } from '../../core/services/produit';
import { Produit } from '../../core/models/produit';

interface CollectionCard {
  title: string;
  description?: string;
  image: string;
  icon: string;
  size?: 'large' | 'normal';
  route: string;
  linkLabel: string;
}

interface Feature {
  icon: 'truck' | 'badge' | 'support';
  title: string;
  text: string;
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    AppIcon,
  ],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil implements OnInit {
  // Propriétés Hero / Header
  logoImage: string = '/logo-kj-sarl.jpeg';
  heroImage: string = 'https://images.unsplash.com/photo-1575037614876-c3852d23c89c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  featuredTitle: string = 'Bière Premium';
  featuredLabel: string = 'Sélection du mois';

  // Noms d'icônes vectorielles SVG pour les atouts
  featureIcons: Record<Feature['icon'], string> = {
    truck: 'truck',
    badge: 'badge-check',
    support: 'headset',
  };

  // Collection Catalogue
  collections: CollectionCard[] = [
    {
      title: 'Bières & Brassins',
      description: 'Découvrez la richesse de notre sélection de bières brassées selon les standards professionnels de distribution.',
      image: '/assets/categorie-bieres.jpg',
      icon: 'beer',
      size: 'large',
      route: '/catalogue',
      linkLabel: 'Explorer la gamme'
    },
    {
      title: 'Boissons Rafraîchissantes',
      description: 'Jus naturels, soft drinks et sodas pour tous vos établissements et événements.',
      image: '/assets/categorie-boissons.jpg',
      icon: 'cup-soda',
      size: 'normal',
      route: '/catalogue',
      linkLabel: 'Voir plus'
    },
    {
      title: 'Sélection Spéciale Pro',
      description: 'Offres exclusives et tarifs de gros adaptés aux professionnels de la restauration.',
      image: '/assets/categorie-pro.jpg',
      icon: 'sparkles',
      size: 'normal',
      route: '/login',
      linkLabel: 'Accéder'
    }
  ];

  // Section Atouts
  features: Feature[] = [
    {
      icon: 'truck',
      title: 'LIVRAISON RAPIDE',
      text: 'Acheminement sécurisé et ponctuel dans toute la région pour approvisionner votre activité sans délai.'
    },
    {
      icon: 'badge',
      title: 'QUALITÉ GARANTIE',
      text: 'Des produits authentiques issus directement des meilleurs brasseurs et circuits certifiés.'
    },
    {
      icon: 'support',
      title: 'SERVICE CLIENT 24/7',
      text: 'Une équipe dédiée et réactive pour accompagner vos commandes et gérer vos réapprovisionnements.'
    }
  ];

  produitsRecents = signal<Produit[]>([]);

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.produitService.getAll().subscribe({
      next: (produits) => {
        // Prendre les 3 ou 4 premiers produits pour l'affichage (par exemple, la catégorie bière)
        this.produitsRecents.set(produits.filter(p => p.categorie === 'biere').slice(0, 4));
      }
    });
  }

  titleClass(card: CollectionCard): string {
    return 'text-white';
  }

  linkClass(card: CollectionCard): string {
    return 'text-[var(--color-primary-light)] hover:text-white font-semibold flex items-center gap-1.5 transition-colors';
  }

  naviguerCatalogue(terme: string): void {
    window.location.href = `/catalogue?recherche=${encodeURIComponent(terme.trim())}`;
  }
}