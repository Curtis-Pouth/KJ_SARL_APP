import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'kj_sarl_token';

// Routes publiques : ne jamais y joindre un token, même périmé/invalide, sinon
// DRF rejette la requête en 401 avant même d'atteindre la vue AllowAny.
const ROUTES_PUBLIQUES = [
  '/register/',
  '/login/',
  '/password-reset/request/',
  '/password-reset/confirm/',
];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const estRoutePublique = ROUTES_PUBLIQUES.some((route) => req.url.includes(route));

  if (estRoutePublique) {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};