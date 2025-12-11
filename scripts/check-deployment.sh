#!/bin/bash

# Script para verificar que el proyecto esté listo para deployment
# Uso: ./scripts/check-deployment.sh

set -e

echo "🔍 Verificando configuración para deployment..."
echo ""

ERRORS=0
WARNINGS=0

# Verificar .env
if [ -f .env ]; then
    echo "✅ .env encontrado"

    # Verificar variables requeridas
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "  ✅ VITE_SUPABASE_URL configurado"
    else
        echo "  ❌ VITE_SUPABASE_URL faltante"
        ERRORS=$((ERRORS + 1))
    fi

    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "  ✅ VITE_SUPABASE_ANON_KEY configurado"
    else
        echo "  ❌ VITE_SUPABASE_ANON_KEY faltante"
        ERRORS=$((ERRORS + 1))
    fi

    if grep -q "VITE_OPENAI_API_KEY" .env; then
        echo "  ✅ VITE_OPENAI_API_KEY configurado (opcional)"
    else
        echo "  ⚠️  VITE_OPENAI_API_KEY no configurado (chatbot sin IA)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ .env no encontrado"
    echo "   Crea uno desde: cp .env.example .env"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Verificar .gitignore
if [ -f .gitignore ]; then
    echo "✅ .gitignore encontrado"
    if grep -q ".env" .gitignore; then
        echo "  ✅ .env está en .gitignore"
    else
        echo "  ❌ .env NO está en .gitignore (¡PELIGRO!)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "⚠️  .gitignore no encontrado"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Verificar dependencias
if [ -f package.json ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json no encontrado"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Verificar SQL
if [ -f sql/EJECUTAR_ESTE_SQL.sql ]; then
    echo "✅ Script SQL encontrado"
else
    echo "❌ sql/EJECUTAR_ESTE_SQL.sql no encontrado"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Test build
echo "🔨 Probando build de producción..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build exitoso"

    # Verificar tamaño
    if [ -d dist ]; then
        SIZE=$(du -sh dist | cut -f1)
        echo "  📦 Tamaño del build: $SIZE"
    fi
else
    echo "❌ Build falló"
    echo "   Ejecuta 'npm run build' para ver los errores"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo "✅ Proyecto listo para deployment!"
    echo ""
    echo "Próximos pasos:"
    echo "1. Sube el SQL a Supabase"
    echo "2. Configura variables de entorno en tu plataforma"
    echo "3. Ejecuta el deployment:"
    echo "   - Vercel: npm run deploy:vercel"
    echo "   - Netlify: npm run deploy:netlify"
    echo "   - Docker: npm run deploy:docker"
    exit 0
else
    echo "❌ Se encontraron $ERRORS errores"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  Se encontraron $WARNINGS advertencias"
    fi
    echo ""
    echo "Corrige los errores antes de deployar."
    exit 1
fi
