#!/bin/bash

# Script para manejar el Reflex Game System con Docker

set -e

case "$1" in
    start|up)
        echo "🚀 Iniciando Reflex Game System..."
        docker-compose up -d
        echo "✅ Sistema iniciado!"
        echo "📱 Frontend: http://localhost"
        echo "🔧 Backend: http://localhost:3001"
        ;;
    
    stop|down)
        echo "🛑 Deteniendo Reflex Game System..."
        docker-compose down
        echo "✅ Sistema detenido!"
        ;;
    
    restart)
        echo "🔄 Reiniciando Reflex Game System..."
        docker-compose down
        docker-compose up -d
        echo "✅ Sistema reiniciado!"
        ;;
    
    build)
        echo "🔨 Construyendo imágenes..."
        docker-compose build --no-cache
        echo "✅ Imágenes construidas!"
        ;;
    
    logs)
        echo "📋 Mostrando logs..."
        docker-compose logs -f
        ;;
    
    status)
        echo "📊 Estado del sistema:"
        docker-compose ps
        ;;
    
    clean)
        echo "🧹 Limpiando sistema..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Sistema limpio!"
        ;;
    
    *)
        echo "🎮 Reflex Game System - Docker Manager"
        echo ""
        echo "Uso: $0 {start|stop|restart|build|logs|status|clean}"
        echo ""
        echo "Comandos:"
        echo "  start   - Iniciar el sistema"
        echo "  stop    - Detener el sistema"
        echo "  restart - Reiniciar el sistema"
        echo "  build   - Construir las imágenes"
        echo "  logs    - Ver logs en tiempo real"
        echo "  status  - Ver estado de los contenedores"
        echo "  clean   - Limpiar todo (contenedores, volúmenes, imágenes)"
        echo ""
        exit 1
        ;;
esac
