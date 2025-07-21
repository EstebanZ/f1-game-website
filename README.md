# 🏎️ F1 Reflex Game

Un juego de reflejos inspirado en las luces de largada de Fórmula 1. ¡Prueba tu tiempo de reacción como un verdadero piloto de F1!

## 🎮 Características

- **Semáforo Auténtico**: 5 luces rojas que se encienden secuencialmente, igual que en F1
- **100% Frontend**: No requiere servidor backend, funciona completamente en el navegador
- **Almacenamiento Local**: Todos tus puntajes se guardan automáticamente en tu navegador
- **Integración Google Sheets**: Registro opcional de estadísticas en Google Sheets
- **Sistema de Puntuación**: Análisis detallado de tiempo de reacción y progreso
- **Dashboard Completo**: Estadísticas, historial y análisis de rendimiento
- **Responsive**: Funciona perfectamente en móviles y escritorio
- **Backup/Restore**: Exporta e importa tus datos

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 16+
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/EstebanZ/f1-game-website.git
cd f1-game-website

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

El juego estará disponible en `http://localhost:3000`

## 🎯 Cómo Jugar

1. **Iniciar**: Ingresa tu email (y nombre si es tu primera vez)
2. **Comenzar**: Presiona "Comenzar Carrera" o `ESPACIO`
3. **Esperar**: Observa las 5 luces rojas encenderse secuencialmente
4. **¡Reaccionar!**: Cuando todas las luces se apaguen, presiona `ESPACIO` lo más rápido posible
5. **Repetir**: Presiona `ESPACIO` de nuevo para una nueva carrera

⚠️ **¡Cuidado con las salidas en falso!** Si presionas antes de que se apaguen todas las luces, será penalización.

## 📊 Sistema de Puntuación

- **< 150ms**: 1000 pts - Nivel Profesional 🏆
- **< 200ms**: 900 pts - Excelente ⭐
- **< 250ms**: 800 pts - Muy Bueno 🥇
- **< 300ms**: 700 pts - Bueno 🥉
- **< 350ms**: 600 pts - Promedio 👍
- **< 400ms**: 500 pts - Necesita Práctica 📈
- **> 400ms**: 400 pts - Sigue Intentando 💪

## 🔧 Configuración Opcional: Integración con Google Sheets

Para registrar automáticamente las estadísticas en Google Sheets:

### 1. Crear Google Sheet
- Ve a [Google Sheets](https://sheets.google.com)
- Crea una nueva hoja de cálculo
- Copia el ID de la hoja (está en la URL entre `/d/` y `/edit`)

### 2. Configurar Google Apps Script
- Ve a [Google Apps Script](https://script.google.com)
- Crea un nuevo proyecto
- Copia el código del archivo `src/scripts/google-apps-script.js`
- Reemplaza `TU_SHEET_ID_AQUI` con el ID de tu hoja
- Guarda el proyecto

### 3. Desplegar como Web App
- Clic en "Desplegar" > "Nueva implementación"
- Tipo: "Aplicación web"
- Ejecutar como: "Yo"
- Quién tiene acceso: "Cualquiera"
- Clic en "Desplegar"
- Autoriza los permisos cuando se solicite
- Copia la URL del Web App

### 4. Configurar en el Frontend
```bash
# Crear archivo .env en la raíz del proyecto
echo "REACT_APP_GOOGLE_SCRIPT_URL=tu_url_del_web_app_aqui" > .env
```

### 5. Estructura de la Hoja
La hoja creará automáticamente las siguientes columnas:
- **Email**: Email del jugador
- **Nombre**: Nombre del jugador
- **Fecha Registro**: Cuándo se registró por primera vez
- **Mejor Score**: Mejor tiempo de reacción
- **Partidas Jugadas**: Total de partidas
- **Última Actualización**: Última vez que jugó

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **CSS3** con animaciones personalizadas
- **Local Storage** para persistencia de datos
- **Google Apps Script** para integración opcional con Sheets

## 📱 Funcionalidades

### Dashboard
- **Estadísticas Generales**: Mejores tiempos, promedio, total de partidas
- **Historial Detallado**: Últimas 10 partidas con análisis
- **Análisis de Progreso**: Gráficos de mejora y consistencia
- **Comparación**: Ve cómo te comparas con otros jugadores

### Gestión de Datos
- **Backup**: Exporta todos tus datos en formato JSON
- **Restore**: Importa datos desde un backup
- **Reset**: Reinicia todas las estadísticas
- **Sincronización**: Los datos se envían automáticamente a Google Sheets (si está configurado)

### Controles
- **Teclado**: `ESPACIO` para jugar y navegar
- **Ratón/Touch**: Clic en botones para todas las acciones
- **Responsive**: Optimizado para móviles y tablets

## 🎨 Estructura del Proyecto

```
f1-game-website/
├── src/
│   ├── components/
│   │   ├── GameComponent.tsx    # Componente principal del juego
│   │   ├── Dashboard.tsx        # Dashboard con estadísticas
│   │   ├── LoginForm.tsx        # Formulario de login
│   │   └── AdminPanel.tsx       # Panel de administración
│   ├── services/
│   │   ├── localData.ts         # Manejo de localStorage
│   │   └── googleSheets.ts      # Integración con Google Sheets
│   ├── scripts/
│   │   └── google-apps-script.js # Script para Google Apps Script
│   └── App.tsx                  # Componente principal
├── public/
├── build/                       # Build de producción
└── package.json
```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm start          # Inicia el servidor de desarrollo
npm test           # Ejecuta los tests
npm run build      # Crea el build de producción

# Deployment
npm run build      # Prepara para producción
# Luego sube la carpeta build/ a tu hosting favorito
```

## 🌐 Deployment

El proyecto es 100% frontend, por lo que puedes desplegarlo en cualquier servicio de hosting estático:

- **Netlify**: Arrastra la carpeta `build/`
- **Vercel**: Conecta tu repositorio de GitHub
- **GitHub Pages**: Configura desde el repositorio
- **Firebase Hosting**: `firebase deploy`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🎯 Roadmap

- [ ] Modo multijugador en tiempo real
- [ ] Logros y medallas
- [ ] Sonidos y efectos de F1
- [ ] Modo entrenamiento con dificultades
- [ ] Análisis más detallado de estadísticas
- [ ] Integración con redes sociales

---

**¡Desarrollado con ❤️ para los fanáticos de la Fórmula 1!**
