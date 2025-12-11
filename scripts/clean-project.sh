#!/bin/bash

# Script para limpiar archivos innecesarios del proyecto
# Uso: ./scripts/clean-project.sh [--deep]

set -e

echo "🧹 Limpiando proyecto..."
echo ""

DEEP_CLEAN=false
if [ "$1" == "--deep" ]; then
    DEEP_CLEAN=true
fi

# Limpieza básica (siempre seguro)
echo "📦 Limpieza básica:"

if [ -d "dist" ]; then
    echo "  🗑️  Eliminando dist/ (1.3 MB)"
    rm -rf dist/
else
    echo "  ✓  dist/ no existe"
fi

if [ -d "database_backup" ]; then
    echo "  🗑️  Eliminando database_backup/ (21 KB)"
    rm -rf database_backup/
else
    echo "  ✓  database_backup/ no existe"
fi

if [ -d "docs-chatbot-reference" ]; then
    echo "  🗑️  Eliminando docs-chatbot-reference/ (72 KB)"
    rm -rf docs-chatbot-reference/
else
    echo "  ✓  docs-chatbot-reference/ no existe"
fi

echo ""

# Limpieza profunda (opcional)
if [ "$DEEP_CLEAN" == true ]; then
    echo "🔥 Limpieza profunda activada:"

    if [ -d "node_modules" ]; then
        echo "  🗑️  Eliminando node_modules/ (265 MB)"
        rm -rf node_modules/
        echo "  💡 Recuerda ejecutar: npm install"
    fi

    if [ -d ".claude" ]; then
        echo "  🗑️  Eliminando .claude/ (historial de conversaciones)"
        rm -rf .claude/
    fi

    # Limpiar caché de npm
    echo "  🗑️  Limpiando caché de npm..."
    npm cache clean --force 2>/dev/null || true
fi

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📊 Espacio liberado:"
if [ "$DEEP_CLEAN" == true ]; then
    echo "  ~267 MB (limpieza profunda)"
else
    echo "  ~1.4 MB (limpieza básica)"
fi

echo ""
echo "💡 Comandos útiles:"
echo "  Regenerar build:     npm run build"
if [ "$DEEP_CLEAN" == true ]; then
    echo "  Reinstalar deps:     npm install"
fi
echo "  Limpieza profunda:   ./scripts/clean-project.sh --deep"
