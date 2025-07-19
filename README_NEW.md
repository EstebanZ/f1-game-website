# 🏎️ F1 Reflex Game - Semáforo de Fórmula 1

Un juego de reflejos inspirado en el semáforo de arranque de la Fórmula 1. ¡Prueba tu tiempo de reacción como un verdadero piloto de F1!

## 🎮 Características

- **Semáforo Auténtico**: 5 luces rojas que se encienden secuencialmente
- **Autenticación Google**: Inicia sesión con tu cuenta de Google
- **Sistema de Puntuación**: Registro de tiempos y mejores marcas
- **Panel de Administración**: Dashboard completo para administradores
- **Responsive**: Funciona perfectamente en móviles y escritorio
- **Control por Teclado**: Todo el juego se controla con la barra espaciadora

## 🚀 Inicio Rápido

### Opción 1: GitHub Codespaces (Recomendado)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/EstebanZ/f1-game-website)

1. Haz clic en el botón "Code" → "Codespaces" → "Create codespace"
2. Espera a que se configure el ambiente automáticamente
3. Una vez listo, el juego estará disponible en los puertos 80 (frontend) y 3001 (backend)

### Opción 2: Ejecución Local

```bash
# Clonar el repositorio
git clone https://github.com/EstebanZ/f1-game-website.git
cd f1-game-website

# Ejecutar con Docker
docker-compose up -d

# El juego estará disponible en http://localhost
```

## 🎯 Cómo Jugar

1. **Iniciar**: Presiona `ESPACIO` para comenzar una carrera
2. **Esperar**: Observa como se encienden las 5 luces rojas secuencialmente
3. **¡Reaccionar!**: Cuando todas las luces se apaguen, presiona `ESPACIO` lo más rápido posible
4. **Repetir**: Presiona `ESPACIO` de nuevo para una nueva carrera

⚠️ **¡Cuidado con las salidas en falso!** Si presionas antes de que se apaguen todas las luces, será penalización.

## 🛠️ Tecnologías

### Frontend
- **React 18** con TypeScript
- **CSS3** con animaciones personalizadas
- **Autenticación Google OAuth**
- **Responsive Design**

### Backend
- **Node.js 18** con Express
- **SQLite** para base de datos
- **JWT** para autenticación
- **Docker** para contenedores

## 📊 Sistema de Puntuación

- **< 200ms**: 1000 puntos 🏆
- **200-299ms**: 800 puntos 🥇
- **300-399ms**: 600 puntos 🥈
- **400-499ms**: 400 puntos 🥉
- **500-599ms**: 200 puntos
- **> 600ms**: 100 puntos

## 🔧 Configuración de Desarrollo

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
JWT_SECRET=tu_jwt_secret_key
NODE_ENV=development
```

### Estructura del Proyecto

```
f1-website/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   └── ...
├── backend/           # API Node.js
│   ├── routes/
│   ├── database/
│   └── server.js
├── data/             # Base de datos SQLite
├── docker-compose.yml
└── .devcontainer/    # Configuración para Codespaces
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🏁 ¡Que Comience la Carrera!

¿Tienes lo que se necesita para ser un piloto de F1? ¡Prueba tu tiempo de reacción y compite con tus amigos!

---

**¿Problemas?** Abre un [issue](https://github.com/EstebanZ/f1-game-website/issues) o contacta al desarrollador.
