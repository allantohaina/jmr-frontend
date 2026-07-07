# Guide concret pour l'IA cPanel

Objectif: `https://jmrtextile.com` doit servir le site JMR directement. Il ne doit plus rediriger vers `https://app.jmrtextile.com/`.

## Configuration domaine

Dans cPanel, verifier les domaines:

```text
jmrtextile.com        -> /public_html/frontend
www.jmrtextile.com    -> /public_html/frontend ou redirection vers https://jmrtextile.com/
app.jmrtextile.com    -> /public_html/frontend si le sous-domaine reste utilise
api.jmrtextile.com    -> /public_html/backend/public
```

Action obligatoire:

```text
Supprimer toute redirection 301/302 de jmrtextile.com vers app.jmrtextile.com.
```

Si cPanel garde une redirection dans l'interface "Redirects", la supprimer aussi.

## Build frontend

Depuis le dossier frontend sur le serveur:

```bash
cd /home/jmrtexti/public_html/frontend
npm install
npm run build
```

Le build doit generer:

```text
/home/jmrtexti/public_html/frontend/out/index.html
```

Si `npm run build` echoue avec une erreur Node.js trop vieux, utiliser Node.js 20 ou 22 dans cPanel avant de relancer le build. Next.js 16 ne fonctionne pas avec Node.js 10.

## Apache / .htaccess

Le fichier suivant doit exister:

```text
/home/jmrtexti/public_html/frontend/.htaccess
```

Il sert les fichiers statiques generes dans `out/`. Si `out/index.html` existe mais que le site affiche encore 403, verifier que ce `.htaccess` est bien present dans `/public_html/frontend`.

## Backend / API

Si le frontend charge mais que les appels API sont bloques, verifier les origines autorisees cote backend:

```text
https://jmrtextile.com
https://www.jmrtextile.com
https://app.jmrtextile.com
```

Le frontend appelle:

```text
https://api.jmrtextile.com/api
```

## Diagnostic rapide

Verifier la redirection:

```bash
curl -I https://jmrtextile.com
```

Resultat attendu:

```text
HTTP/2 200
```

ou une redirection uniquement vers:

```text
https://jmrtextile.com/
```

Resultat a corriger:

```text
location: https://app.jmrtextile.com/
```

Verifier le fichier d'accueil:

```bash
ls -la /home/jmrtexti/public_html/frontend/out/index.html
```

Si le fichier n'existe pas, relancer `npm run build`.

## Resume de la correction

1. Enlever la redirection `jmrtextile.com -> app.jmrtextile.com`.
2. Faire pointer `jmrtextile.com` vers `/public_html/frontend`.
3. Lancer `npm install` puis `npm run build`.
4. Verifier que `/public_html/frontend/out/index.html` existe.
5. Verifier que `/public_html/frontend/.htaccess` existe.
6. Ajouter `https://jmrtextile.com` dans les origines autorisees du backend si l'API bloque les requetes.
