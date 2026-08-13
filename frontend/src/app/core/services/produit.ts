import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit, StatistiquesProduits } from '../models/produit';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/produits/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  getById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}${id}/`);
  }

  create(produit: Partial<Produit>): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  update(id: number, produit: Partial<Produit>): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}${id}/`, produit);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  getStatistiques(): Observable<StatistiquesProduits> {
    return this.http.get<StatistiquesProduits>(`${this.apiUrl}statistiques/`);
  }

  uploaderPhoto(id: number, fichier: File): Observable<Produit> {
    const formData = new FormData();
    formData.append('photo', fichier);
    return this.http.patch<Produit>(`${this.apiUrl}${id}/`, formData);
  }
}