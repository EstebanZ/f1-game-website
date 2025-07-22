# 🚀 Netlify Deployment Setup (GRATIS)

## ¿Por qué Netlify?

- **💰 100% GRATUITO** para sitios estáticos
- **🔄 Builds automáticos** desde GitHub
- **🔒 HTTPS gratuito** y certificados SSL
- **🌍 CDN global** para mejor rendimiento
- **🌐 Dominios personalizados** gratuitos
- **👀 Deploy previews** para pull requests

## Configuración Automática

Este repositorio incluye un GitHub Action (`.github/workflows/deploy.yml`) que automáticamente despliega la aplicación en Netlify.

## Pasos para configurar el despliegue GRATUITO

### 1. Crear cuenta en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Regístrate gratis con tu cuenta de GitHub
3. Es completamente gratuito para sitios estáticos

### 2. Obtener tokens de Netlify

1. Ve a [app.netlify.com/user/applications](https://app.netlify.com/user/applications)
2. Haz clic en **"New access token"**
3. Dale un nombre como "GitHub Actions"
4. Copia el token generado (será tu `NETLIFY_AUTH_TOKEN`)

### 3. Crear un sitio en Netlify

1. Ve a [app.netlify.com](https://app.netlify.com)
2. Haz clic en **"Add new site"** → **"Deploy manually"**
3. Arrastra cualquier carpeta temporal (será reemplazada por el workflow)
4. Una vez creado, ve a **Site settings**
5. Copia el **Site ID** (será tu `NETLIFY_SITE_ID`)

### 4. Configurar secrets en GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Agrega estos secrets:
   - **Name**: `NETLIFY_AUTH_TOKEN` → **Secret**: El token de Netlify
   - **Name**: `NETLIFY_SITE_ID` → **Secret**: El Site ID de Netlify
   - **Name**: `REACT_APP_GOOGLE_SCRIPT_URL` → **Secret**: Tu URL del Google Apps Script (opcional)

### 5. Deploy automático

- **🚀 Automático**: Cualquier push a `main` desplegará a producción
- **👀 Preview**: Los pull requests crearán previews automáticos
- **💸 Gratis**: Sin límites para sitios estáticos

### 6. Tu sitio estará disponible en

```
https://[site-name].netlify.app
```

O en tu dominio personalizado gratuito

## Estructura del Workflow

El workflow realiza los siguientes pasos:

1. **Checkout**: Descarga el código fuente
2. **Setup Node.js**: Configura Node.js 18
3. **Install dependencies**: Ejecuta `npm ci`
4. **Build**: Ejecuta `npm run build` con variables de entorno
5. **Deploy**: Despliega a Netlify automáticamente

## Troubleshooting

### Error: "Missing NETLIFY_AUTH_TOKEN"
- Verifica que agregaste el token correcto en GitHub Secrets

### Error: "Missing NETLIFY_SITE_ID"
- Confirma que copiaste el Site ID correcto desde Netlify

### Error en el build
- Revisa los logs en la pestaña "Actions"
- Verifica que todas las dependencias estén en `package.json`

### La aplicación no carga correctamente
- Netlify maneja automáticamente las rutas de SPA
- No necesitas configuración adicional para React

## Ventajas de Netlify vs GitHub Pages

| Característica | Netlify | GitHub Pages |
|---|---|---|
| **Precio** | Gratis ✅ | $48/año para repos privados ❌ |
| **Builds** | Automáticos ✅ | Requiere configuración ⚠️ |
| **HTTPS** | Incluido ✅ | Incluido ✅ |
| **Dominio personalizado** | Gratis ✅ | Gratis ✅ |
| **Deploy previews** | Incluido ✅ | No ❌ |
| **CDN** | Global ✅ | Limitado ⚠️ |

## Variables de entorno disponibles

- `NETLIFY_AUTH_TOKEN`: Token de autenticación de Netlify
- `NETLIFY_SITE_ID`: ID único del sitio en Netlify
- `REACT_APP_GOOGLE_SCRIPT_URL`: URL del Google Apps Script (opcional)

## Notas importantes

- El deployment solo se activa en pushes a `main`
- Los archivos se construyen para producción optimizada
- El sitio se actualiza automáticamente en 1-2 minutos
- Los pull requests generan previews automáticos con URLs únicas
- **TODO ES COMPLETAMENTE GRATUITO** 🎉
