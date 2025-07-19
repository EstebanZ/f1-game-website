# 🏎️ Reflex Game System

Un sistema completo de juego de reflejos con autenticación por email de Gmail, backend en Node.js y frontend en React.

## 🎮 Características

- **Autenticación simple**: Solo requiere email de Gmail válido
- **Juego de reflejos**: Mide tu tiempo de reacción presionando la barra espaciadora
- **Sistema de puntuaciones**: Guarda y muestra las mejores puntuaciones
- **Dashboard personal**: Estadísticas y historial de cada usuario
- **Panel de administración**: Dashboard completo para administradores
- **Base de datos SQLite**: Almacenamiento local simple y eficiente

## 🚀 Tecnologías

### Backend
- Node.js + Express
- SQLite3
- JWT para autenticación
- Validación de emails de Gmail

### Frontend
- React 18 con TypeScript
- Axios para HTTP requests
- CSS personalizado con animaciones
- Responsive design

## 📋 Requisitos

- Node.js 16 o superior (para desarrollo local)
- NPM o Yarn (para desarrollo local)
- Docker y Docker Compose (para deployment)

## 🛠️ Instalación y Ejecución

### 🐳 Opción 1: Con Docker (Recomendado)

La forma más fácil de ejecutar el proyecto es usando Docker Compose:

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd reflex-game-system
```

2. **Configurar variables de entorno**
```bash
cp .env.docker .env
# Editar .env con tus valores personalizados
```

3. **Ejecutar con Docker Compose**
```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Ver los logs
docker-compose logs -f

# Parar los servicios
docker-compose down
```

La aplicación estará disponible en:
- **Frontend**: `http://localhost` (puerto 80)
- **Backend API**: `http://localhost:3001`

### 💻 Opción 2: Desarrollo Local

Para desarrollo local sin Docker:

1. **Instalar dependencias del backend**
```bash
npm install
```

2. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
cd ..
```

3. **Configurar variables de entorno**
```bash
# Editar el archivo .env en la raíz del proyecto
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
```

4. **Ejecutar el backend**
```bash
npm run dev
```

5. **Ejecutar el frontend** (en otra terminal)
```bash
cd frontend
npm start
```

El frontend estará disponible en `http://localhost:3000` y el backend en `http://localhost:3001`.

## 🐳 Comandos de Docker Útiles

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir las imágenes
docker-compose build

# Reconstruir y ejecutar
docker-compose up -d --build

# Parar y eliminar contenedores
docker-compose down

# Parar, eliminar contenedores y volúmenes
docker-compose down -v

# Ejecutar comandos dentro del contenedor backend
docker-compose exec backend sh

# Ver la base de datos
docker-compose exec backend ls -la backend/database/
```

## 🎯 Cómo Jugar

1. **Registro/Login**: Ingresa tu email de Gmail
2. **Empezar el juego**: Haz clic en "Empezar Juego"
3. **Esperar**: Espera a que el área se ponga verde
4. **Reaccionar**: Presiona la barra espaciadora lo más rápido posible
5. **Ver resultados**: Tu tiempo de reacción y puntuación se guardarán automáticamente

## 📊 Sistema de Puntuación

- **< 200ms**: 1000 puntos 🥇
- **200-299ms**: 800 puntos 🥈
- **300-399ms**: 600 puntos 🥉
- **400-499ms**: 400 puntos
- **500-599ms**: 200 puntos
- **≥ 600ms**: 100 puntos

## 👥 Roles de Usuario

### Usuario Normal
- Jugar el juego de reflejos
- Ver su dashboard personal
- Ver estadísticas y historial

### Administrador
- Todas las funciones de usuario normal
- Dashboard de administración global
- Leaderboard de todos los usuarios
- Gestión de usuarios
- Estadísticas generales del sistema

## 🗃️ Estructura de Base de Datos

### Tabla `users`
- `id`: ID único del usuario
- `email`: Email de Gmail del usuario
- `name`: Nombre extraído del email
- `is_admin`: Si es administrador
- `created_at`: Fecha de registro

### Tabla `game_scores`
- `id`: ID único de la puntuación
- `user_id`: Referencia al usuario
- `reaction_time`: Tiempo de reacción en milisegundos
- `score`: Puntuación obtenida
- `game_type`: Tipo de juego (default: 'reflex')
- `created_at`: Fecha del juego

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login con email
- `GET /api/auth/verify` - Verificar token JWT

### Juego
- `POST /api/game/score` - Guardar puntuación
- `GET /api/game/scores` - Obtener puntuaciones del usuario
- `GET /api/game/stats` - Obtener estadísticas del usuario

### Administración (requiere permisos de admin)
- `GET /api/admin/dashboard` - Dashboard de administración
- `GET /api/admin/leaderboard` - Leaderboard global
- `GET /api/admin/users` - Lista de usuarios
- `GET /api/admin/users/:userId` - Detalles de usuario específico

## 🔒 Seguridad

- Validación de emails de Gmail con regex
- Autenticación JWT con expiración
- Sanitización de entradas
- Headers de seguridad con Helmet
- CORS configurado

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor crea un issue describiendo:
- Pasos para reproducir el bug
- Comportamiento esperado vs actual
- Screenshots si es necesario
- Información del navegador/sistema

## ✨ Mejoras Futuras

- [ ] Modo multijugador en tiempo real
- [ ] Diferentes tipos de juegos de reflejos
- [ ] Achievements y badges
- [ ] Modo oscuro
- [ ] Exportar estadísticas
- [ ] Notificaciones push
- [ ] Integración con redes sociales

---

¡Disfruta probando tus reflejos! 🎮⚡
