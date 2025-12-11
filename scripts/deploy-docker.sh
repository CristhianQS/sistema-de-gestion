#!/bin/bash

# Script de deployment usando Docker
# Uso: ./scripts/deploy-docker.sh

set -e

echo "🐳 Iniciando deployment con Docker..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "   Instala desde: https://www.docker.com/get-started"
    exit 1
fi

# Variables
IMAGE_NAME="sistema-upeu"
CONTAINER_NAME="sistema-upeu"
PORT=80

# Detener contenedor existente
echo "🛑 Deteniendo contenedor existente (si existe)..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Construir imagen
echo "🔨 Construyendo imagen Docker..."
docker build -t $IMAGE_NAME .

# Ejecutar contenedor
echo "🚀 Iniciando contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:80 \
  --restart unless-stopped \
  $IMAGE_NAME

echo "✅ Deploy completado!"
echo "🌐 Aplicación disponible en: http://localhost:$PORT"
echo "📊 Ver logs: docker logs -f $CONTAINER_NAME"
echo "🛑 Detener: docker stop $CONTAINER_NAME"
