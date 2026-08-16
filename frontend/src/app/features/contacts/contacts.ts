import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../core/models/contact';
import { ContactService } from '../../core/services/contact';
import { AppIcon } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIcon],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts implements OnInit {
  contacts = signal<Contact[]>([]);
  recherche = signal('');
  chargement = signal(true);
  erreur = signal('');

  contactsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    if (!terme) {
      return this.contacts();
    }

    return this.contacts().filter((contact) =>
      [contact.nom, contact.telephone, contact.email]
        .join(' ')
        .toLowerCase()
        .includes(terme)
    );
  });

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getAll().subscribe({
      next: (contacts) => {
        this.contacts.set(contacts);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les contacts.');
        this.chargement.set(false);
      },
    });
  }

  initiales(nom: string): string {
    return nom
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((mot) => mot[0].toUpperCase())
      .join('');
  }
}
