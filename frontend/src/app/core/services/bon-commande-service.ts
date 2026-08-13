import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BonCommandeResultat, CreerBonCommandePayload } from '../models/bon-commande';

@Injectable({ providedIn: 'root' })
export class BonCommandeService {
  private apiUrl = `${environment.apiUrl}/bons-stock/creer/`;

  constructor(private http: HttpClient) {}

  creer(payload: CreerBonCommandePayload): Observable<BonCommandeResultat> {
    return this.http.post<BonCommandeResultat>(this.apiUrl, payload);
  }
}