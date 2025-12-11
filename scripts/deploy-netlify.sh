#!/bin/bash

# Script de deployment para Netlify
# Uso: ./scripts/deploy-netlify.sh [--prod]

set -e

echo "🚀 Iniciando deployment en Netlify..."

# Verificar que netlify esté instalado
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI no está instalado"
    echo "   Instala con: npm install -g netlify-cli"
    exit 1
fi

# Verificar que exista .env
if [ ! -f .env ]; then
    echo "⚠️  Advertencia: .env no encontrado"
    echo "   Las variables de entorno deben configurarse en Netlify Dashboard"
fi

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf dist/

# Construir proyecto
echo "🔨 Construyendo proyecto..."
npm run build

# Deploy
if [ "$1" == "--prod" ]; then
    echo "📦 Deployando a PRODUCCIÓN..."
    netlify deploy --prod --dir=dist
else
    echo "📦 Deployando a PREVIEW..."
    netlify deploy --dir=dist
fi

echo "✅ Deploy completado!"
echo "📊 Verifica el deployment en: https://app.netlify.com/"
