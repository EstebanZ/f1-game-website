# 🚀 GitHub Pages Deployment Setup

## Configuración Automática

Este repositorio incluye un GitHub Action (`.github/workflows/deploy.yml`) que automáticamente despliega la aplicación en GitHub Pages.

## Pasos para habilitar el despliegue:

### 1. Habilitar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Navega a **Settings** > **Pages**
3. En la sección "Source", selecciona **"GitHub Actions"**

### 2. Configurar variables de entorno (opcional)
Si usas la integración con Google Sheets:

1. Ve a **Settings** > **Secrets and variables** > **Actions**
2. Haz clic en **"New repository secret"**
3. Agrega:
   - **Name**: `REACT_APP_GOOGLE_SCRIPT_URL`
   - **Secret**: Tu URL del Google Apps Script

### 3. Trigger del deployment
- **Automático**: Cualquier push a la rama `main` activará el workflow
- **Manual**: También puedes ejecutar el workflow manualmente desde la pestaña "Actions"

### 4. Verificar el deployment
1. Ve a la pestaña **"Actions"** en tu repositorio
2. Verifica que el workflow "Deploy to GitHub Pages" se ejecute correctamente
3. Una vez completado, tu aplicación estará disponible en:
   ```
   https://EstebanZ.github.io/f1-game-website
   ```

## Estructura del Workflow

El workflow realiza los siguientes pasos:

1. **Checkout**: Descarga el código fuente
2. **Setup Node.js**: Configura Node.js 18
3. **Install dependencies**: Ejecuta `npm ci`
4. **Build**: Ejecuta `npm run build` con variables de entorno
5. **Upload artifact**: Sube el directorio `build/`
6. **Deploy**: Despliega a GitHub Pages

## Troubleshooting

### Error: "Actions workflow not found"
- Asegúrate de que el archivo `.github/workflows/deploy.yml` existe en la rama `main`

### Error: "Permission denied"
- Verifica que GitHub Pages está habilitado con "GitHub Actions" como source

### Error en el build
- Revisa los logs en la pestaña "Actions"
- Verifica que todas las dependencias estén en `package.json`
- Confirma que las variables de entorno estén configuradas correctamente

### La aplicación no carga correctamente
- Verifica que `homepage` en `package.json` apunte a la URL correcta de GitHub Pages
- Asegúrate de que todas las rutas sean relativas

## Configuración del package.json

El `homepage` debe estar configurado como:
```json
{
  "homepage": "https://EstebanZ.github.io/f1-game-website"
}
```

## Variables de entorno disponibles

- `REACT_APP_GOOGLE_SCRIPT_URL`: URL del Google Apps Script (opcional)
- `REACT_APP_DEBUG`: Modo debug (opcional)

## Notas importantes

- El deployment solo se activa en pushes a `main`
- Los archivos se construyen para producción optimizada
- El sitio se actualiza automáticamente en pocos minutos después del push exitoso
