import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginPayload,
  LoginResponse,
  RegisterClientPayload,
  RegisterComptablePayload,
  Utilisateur,
} from '../models/utilisateur';

const TOKEN_KEY = 'kj_sarl_token';
const REFRESH_KEY = 'kj_sarl_refresh';
const ROLE_KEY = 'kj_sarl_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isLoggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));
  readonly currentUser = signal<Utilisateur | null>(null);

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Inscription publique — crée uniquement des comptes Client. */
  registerClient(payload: RegisterClientPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, payload);
  }

  /** Inscription réservée au personnel déjà connecté (comptable/administrateur). */
  registerComptable(payload: RegisterComptablePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-comptable/`, payload);
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, payload).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(REFRESH_KEY, response.refresh);
        localStorage.setItem(ROLE_KEY, response.role);
        this.isLoggedIn.set(true);
        this.currentUser.set(response.utilisateur);
      })
    );
  }
  /** Charge l'utilisateur courant depuis l'API (utile après un rafraîchissement de page). */
  chargerUtilisateurCourant(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/me/`).pipe(
      tap((utilisateur) => this.currentUser.set(utilisateur))
    );
  }

  changePassword(ancien_mot_de_passe: string, nouveau_mot_de_passe: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/change-password/`, {
      ancien_mot_de_passe,
      nouveau_mot_de_passe,
    });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset/request/`, { email });
  }

  confirmPasswordReset(
    email: string,
    code: string,
    nouveau_mot_de_passe: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset/confirm/`, {
      email,
      code,
      nouveau_mot_de_passe,
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  }
}