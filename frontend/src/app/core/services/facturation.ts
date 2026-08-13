import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClientRecherche,
  CreerFacturationPayload,
  Facture,
  StatistiquesClients,
} from '../models/facturation';

@Injectable({ providedIn: 'root' })
export class FacturationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  rechercherClients(q: string): Observable<ClientRecherche[]> {
    return this.http.get<ClientRecherche[]>(`${this.apiUrl}/clients/`, {
      params: { q },
    });
  }

  creer(payload: CreerFacturationPayload): Observable<Facture> {
    return this.http.post<Facture>(`${this.apiUrl}/facturation/creer/`, payload);
  }

  getStatistiquesClients(): Observable<StatistiquesClients> {
    return this.http.get<StatistiquesClients>(`${this.apiUrl}/statistiques-clients/`);
  }
}