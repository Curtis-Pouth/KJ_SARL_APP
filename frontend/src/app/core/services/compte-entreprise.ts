import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompteEntreprise } from '../models/compte-entreprise';

@Injectable({ providedIn: 'root' })
export class CompteEntrepriseService {
  private apiUrl = `${environment.apiUrl}/comptes-entreprise/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CompteEntreprise[]> {
    return this.http.get<CompteEntreprise[]>(this.apiUrl);
  }
}