import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface CollectionCard {
  title: string;
  description?: string;
  image: string;
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
    RouterLinkActive
  ],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil {
  // Propriétés Hero / Header
  logoImage: string = '';
  heroImage: string = '';
  featuredTitle: string = 'Bière Premium';
  featuredLabel: string = 'Sélection du mois';

  // Collection Catalogue
  collections: CollectionCard[] = [
    {
      title: 'Bières Traditionnelles',
      description: 'Découvrez la richesse culturelle à travers nos bières brassées selon les traditions localement reconnues.',
      image: '',
      size: 'large',
      route: '/catalogue',
      linkLabel: 'Explorer la gamme'
    },
    {
      title: 'Boissons Rafraîchissantes',
      description: 'Jus et sodas pour tous vos événements.',
      image: '',
      size: 'normal',
      route: '/catalogue',
      linkLabel: 'Voir plus'
    },
    {
      title: 'Sélection Spéciale Pro',
      description: 'Offres adaptées aux professionnels de la restauration.',
      image: '',
      size: 'normal',
      route: '/espace-pro',
      linkLabel: 'Accéder'
    }
  ];

  // Section Atouts
  features: Feature[] = [
    {
      icon: 'truck',
      title: 'LIVRAISON RAPIDE',
      text: 'Acheminement sécurisé et ponctuel dans toute la région.'
    },
    {
      icon: 'badge',
      title: 'QUALITÉ GARANTIE',
      text: 'Des produits authentiques issus des meilleurs circuits de distribution.'
    },
    {
      icon: 'support',
      title: 'SERVICE CLIENT 24/7',
      text: 'Une équipe à votre écoute pour accompagner vos commandes.'
    }
  ];

  // Méthodes pour le style dynamique
  overlayClass(card: CollectionCard): string {
    return card.size === 'large'
      ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
      : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent';
  }

  titleClass(card: CollectionCard): string {
    return 'text-white';
  }

  linkClass(card: CollectionCard): string {
    return 'text-amber-400 hover:text-amber-300';
  }
}