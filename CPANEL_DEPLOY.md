# Deploiement cPanel + Git pour ce projet

Ce projet doit etre deploye comme une application `Next.js` avec `Node.js`, pas comme un site statique exporte.

## Pourquoi

- Le projet utilise des `Server Actions`, `cookies()` et des `redirect()` serveur.
- Le build ne sort pas dans `public/`.
- Le dossier `public/` sert uniquement aux assets statiques et sera servi par Next a des URLs comme `/navbar/logo.svg`.

## Prerequis cPanel

- Node.js `>= 20.9.0`
- Une application Node.js active dans cPanel
- Le depot clone dans un dossier hors `public_html`

Exemple de chemin de depot:

```text
/home/CPANEL_USER/repositories/jmr-textile-frontend
```

## Reglages conseilles dans cPanel

Dans `Setup Node.js App`:

- Node.js version: `20` ou plus recent
- Application mode: `Production`
- Application root: le chemin du depot Git
- Application URL: le domaine ou sous-domaine voulu
- Application startup file: `app.js`

Important:

- Ne pas pointer le site vers `public/`
- Ne pas deployer ce projet directement dans `public_html`
- Ne pas utiliser le `.htaccess` pour bloquer le code source: le bon isolement se fait en mettant l'application hors `public_html`

## Commandes apres chaque mise a jour Git

Dans le terminal cPanel, depuis le dossier du depot:

```bash
npm install
npm run build
mkdir -p tmp && touch tmp/restart.txt
```

Selon l'hebergement, tu peux aussi redemarrer l'application depuis l'interface cPanel au lieu de `touch tmp/restart.txt`.

## Variables d'environnement

Configurer au minimum dans cPanel:

```text
NODE_ENV=production
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_USE_MOCKS=false
```

Ajoute egalement toute variable backend/securite necessaire au projet.

## Notes projet

- `next.config.ts` utilise maintenant `output: "standalone"` pour simplifier le runtime cPanel.
- `app.js` demarre le serveur standalone genere par `next build`.
- Les polices Google ne sont plus telechargees au moment du build, ce qui evite un echec de build sur certains hebergements.
