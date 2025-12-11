#!/bin/bash

# Script de deployment para Vercel
# Uso: ./scripts/deploy-vercel.sh [--prod]

set -e

echo "🚀 Iniciando deployment en Vercel..."

# Verificar que vercel esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado"
    echo "   Instala con: npm install -g vercel"
    exit 1
fi

# Verificar que exista .env
if [ ! -f .env ]; then
    echo "⚠️  Advertencia: .env no encontrado"
    echo "   Las variables de entorno deben configurarse en Vercel Dashboard"
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
    vercel --prod
else
    echo "📦 Deployando a PREVIEW..."
    vercel
fi

echo "✅ Deploy completado!"
echo "📊 Verifica el deployment en: https://vercel.com/dashboard"
