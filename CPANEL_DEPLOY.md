# Deploiement cPanel statique + Git pour ce projet

Ce projet est prepare pour un cPanel sans `Setup Node.js App`: le frontend Next.js est exporte en fichiers statiques dans `out/`, puis Apache le sert via `.htaccess`.

## Domaines cPanel conseilles

- `api.jmrtextile.com` -> `/public_html/backend/public`
- `app.jmrtextile.com` -> `/public_html/frontend`
- `jmrtextile.com` -> `/public_html/frontend`
- `www.jmrtextile.com` -> `/public_html/frontend` ou redirection vers `https://jmrtextile.com/`

Important: ne pas configurer `jmrtextile.com` en redirection 301 vers `https://app.jmrtextile.com/`.
Le domaine principal doit servir le meme dossier que le frontend pour eviter le 403 vu sur `app.jmrtextile.com`.

Le `.htaccess` de `/public_html/frontend` redirige les requetes Apache vers le dossier `out/`.

Si le backend limite les origines autorisees (CORS/Sanctum/etc.), ajouter au minimum:

```text
https://jmrtextile.com
https://www.jmrtextile.com
https://app.jmrtextile.com
```

## Build local

Depuis le dossier `frontend`:

```bash
npm install
npm run build
```

Ensuite deploie le dossier `out/` dans `/public_html/frontend/out` avec le `.htaccess` a la racine de `/public_html/frontend`.

## API

Le frontend statique appelle directement le backend:

```text
NEXT_PUBLIC_API_URL=https://api.jmrtextile.com/api
```

Sur cPanel sans Node, les routes `app/api` Next et les cookies serveur ne sont pas disponibles. Les protections importantes doivent donc rester verifiees dans le backend PHP.
