#!/bin/bash

# Script pour creer un zip de production pour le frontend (Next.js)
# Usage: ./zip-frontend-production.sh [chemin-projet] [nom-zip] [dossier-sortie]
# Option: INCLUDE_NODE_MODULES=true pour embarquer node_modules (non recommande pour Linux).

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_PATH=${1:-.}
ZIP_NAME=${2:-frontend-production-$(date +%Y%m%d-%H%M%S).zip}
OUTPUT_DIR=${3:-/mnt/user-data/outputs}
INCLUDE_NODE_MODULES=${INCLUDE_NODE_MODULES:-false}

echo -e "${GREEN}=== Preparation du frontend pour la production ===${NC}"
echo -e "Projet: ${YELLOW}$PROJECT_PATH${NC}"
echo -e "Archive: ${YELLOW}$ZIP_NAME${NC}"
echo ""

if [ ! -f "$PROJECT_PATH/package.json" ]; then
    echo -e "${RED}Erreur: package.json introuvable. Ce n'est pas un projet frontend valide.${NC}"
    exit 1
fi

TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}OK${NC} Dossier temporaire cree: $TEMP_DIR"

mkdir -p "$TEMP_DIR/frontend-production"

echo -e "${GREEN}->${NC} Copie des fichiers..."

for dir in app public .next; do
    if [ -d "$PROJECT_PATH/$dir" ]; then
        cp -r "$PROJECT_PATH/$dir" "$TEMP_DIR/frontend-production/" 2>/dev/null
    fi
done

if [ "$INCLUDE_NODE_MODULES" = "true" ] && [ -d "$PROJECT_PATH/node_modules" ]; then
    cp -r "$PROJECT_PATH/node_modules" "$TEMP_DIR/frontend-production/" 2>/dev/null
fi

for file in \
    package.json \
    package-lock.json \
    next.config.js \
    next.config.mjs \
    next.config.ts \
    next-env.d.ts \
    tsconfig.json \
    postcss.config.js \
    postcss.config.mjs \
    tailwind.config.js \
    tailwind.config.ts \
    README.md; do
    if [ -f "$PROJECT_PATH/$file" ]; then
        cp "$PROJECT_PATH/$file" "$TEMP_DIR/frontend-production/" 2>/dev/null
    fi
done

if [ -f "$PROJECT_PATH/.env.example" ]; then
    cp "$PROJECT_PATH/.env.example" "$TEMP_DIR/frontend-production/" 2>/dev/null
elif [ -f "$PROJECT_PATH/.env" ]; then
    cp "$PROJECT_PATH/.env" "$TEMP_DIR/frontend-production/.env.example" 2>/dev/null
fi

echo -e "${GREEN}->${NC} Nettoyage..."

if [ -d "$TEMP_DIR/frontend-production/.next/cache" ]; then
    rm -rf "$TEMP_DIR/frontend-production/.next/cache" 2>/dev/null
fi

if [ -d "$TEMP_DIR/frontend-production/node_modules/.cache" ]; then
    rm -rf "$TEMP_DIR/frontend-production/node_modules/.cache" 2>/dev/null
fi

find "$TEMP_DIR/frontend-production" -name ".git" -type d -exec rm -rf {} + 2>/dev/null
find "$TEMP_DIR/frontend-production" -name ".gitignore" -type f -delete 2>/dev/null
find "$TEMP_DIR/frontend-production" -name ".gitkeep" -type f -delete 2>/dev/null
find "$TEMP_DIR/frontend-production" -name ".DS_Store" -type f -delete 2>/dev/null
find "$TEMP_DIR/frontend-production" -name "Thumbs.db" -type f -delete 2>/dev/null

echo -e "${GREEN}->${NC} Creation de l'archive ZIP..."
cd "$TEMP_DIR" || exit 1
zip -r "$ZIP_NAME" frontend-production -q

if [ ! -d "$OUTPUT_DIR" ]; then
    echo -e "${YELLOW}Dossier de sortie introuvable: $OUTPUT_DIR. Utilisation du dossier courant.${NC}"
    OUTPUT_DIR="."
fi
mv "$ZIP_NAME" "$OUTPUT_DIR/"

rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}=== Termine ===${NC}"
echo -e "Archive creee: ${GREEN}$ZIP_NAME${NC}"
echo ""
echo -e "${YELLOW}Etapes de deploiement:${NC}"
echo "1. Extraire le ZIP sur le serveur"
echo "2. Copier .env.example vers .env et configurer"
echo "3. Installer les deps: npm ci"
echo "4. Builder: npm run build"
echo "5. Lancer: npm run start"
