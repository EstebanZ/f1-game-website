#!/bin/bash

# Script de inicio para GitHub Codespaces
echo "🏎️ Iniciando F1 Reflex Game..."

# Verificar que Docker esté funcionando
echo "📋 Verificando Docker..."
docker --version

# Crear directorio de datos si no existe
mkdir -p ./data

# Inicializar la base de datos
echo "🗄️ Inicializando base de datos..."
cd data && node init.js && cd ..

# Construir y ejecutar los contenedores
echo "🐳 Iniciando contenedores..."
docker-compose up -d

# Mostrar estado de los contenedores
echo "📊 Estado de contenedores:"
docker-compose ps

# Mostrar URLs disponibles
echo ""
echo "🎉 ¡F1 Reflex Game está listo!"
echo "📍 Frontend: http://localhost"
echo "📍 Backend API: http://localhost:3001"
echo ""
echo "🎮 ¡Presiona ESPACIO para jugar!"
