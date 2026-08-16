import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contact } from '../models/contact';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = `${environment.apiUrl}/contacts/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }
}
