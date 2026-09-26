# 🚀 Guía de Despliegue en Vercel & Producción

Esta guía detalla los pasos para desplegar el **Sistema de Gestión de Recursos Humanos** con su **Modo Demo para Reclutadores**.

---

## 🏛️ Arquitectura del Despliegue

```
┌─────────────────────────────────┐
│     FRONTEND (Vercel)           │
│     React + Vite + MUI          │
│  https://tu-rrhh.vercel.app     │
└───────────────┬─────────────────┘
                │  API Requests (HTTPS)
                ▼
┌─────────────────────────────────┐
│     BACKEND (Railway / Render)  │
│     Node.js + Express REST API  │
│  https://tu-api.up.railway.app  │
└───────────────┬─────────────────┘
                │  MySQL Connection
                ▼
┌─────────────────────────────────┐
│  BASE DE DATOS CLOUD (MySQL)    │
│  TiDB Cloud / Aiven / Railway   │
└─────────────────────────────────┘
```

---

## 📦 Paso 1: Base de Datos MySQL en la Nube (Gratis)

Puedes utilizar cualquiera de estos proveedores gratuitos de MySQL:
1. **[TiDB Serverless](https://tidb.cloud/)** (5 GB gratis, compatible 100% con MySQL).
2. **[Aiven MySQL](https://aiven.io/)** (Nivel gratuito para proyectos).
3. **[Railway MySQL](https://railway.app/)** (Permite crear la base de datos y backend juntos).

### Pasos para inicializar la base de datos:
1. Crea tu base de datos (ej. `sistema_rrhh`).
2. Obtén las credenciales: `Host`, `User`, `Password`, `Port` y `Database`.
3. Ejecuta el script de creación de tablas y el semillero inicial (`backend/seed.js`):
   ```bash
   cd backend
   node seed.js
   ```

---

## ⚙️ Paso 2: Despliegue del Backend

Recomendado en **Railway** o **Render** para mantener el servidor Express escuchando y conectado a MySQL:

### En Railway:
1. Conecta tu repositorio de GitHub.
2. Selecciona la carpeta raíz o configura `Root Directory: backend`.
3. Configura las siguientes **Variables de Entorno (Environment Variables)**:
   - `DB_HOST`: Host de tu base de datos MySQL.
   - `DB_USER`: Usuario de MySQL.
   - `DB_PASSWORD`: Contraseña de MySQL.
   - `DB_NAME`: Nombre de la base de datos (ej: `sistema_rrhh`).
   - `DB_PORT`: Puerto (generalmente `3306` o el provisto).
   - `JWT_SECRET`: Una clave secreta larga y aleatoria.
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: URL que te asigne Vercel (ej: `https://mi-sistema-rrhh.vercel.app`).
4. Haz clic en **Deploy**. Obtendrás una URL como `https://mi-api-rrhh.up.railway.app`.

---

## 🌐 Paso 3: Despliegue del Frontend en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New Project"** e importa tu repositorio.
3. En la configuración del proyecto:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (haz clic en *Edit* y selecciona la carpeta `frontend`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En **Environment Variables**, agrega:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://tu-api-desplegada.up.railway.app/api` (la URL de tu backend en el Paso 2).
5. Presiona **Deploy**.

¡Tu aplicación estará en vivo con HTTPS y soporte completo para el modo demo y navegación SPA!

---

## 🚀 Verificación del Modo Demo en Producción

1. Ingresa a la URL de tu frontend en Vercel.
2. Verás el botón destacado **"🚀 Acceso Modo Demo (Reclutadores)"**.
3. Al hacer clic, se abrirá el modal con los 4 perfiles preconfigurados:
   - 🛡️ **Administrador de RRHH** (`admin@instituto.edu`)
   - 👔 **Directivo** (`director@instituto.edu`)
   - 📚 **Docente** (`profesor@instituto.edu`)
   - 💼 **Personal de Apoyo** (`apoyo@instituto.edu`)
4. Al ingresar en cualquiera de los roles:
   - Aparece la barra superior dorada indicando que el modo demo está activo.
   - El evaluador puede realizar pruebas, crear registros y explorar permisos.
   - Al pulsar **"Salir del Demo"** o cerrar sesión, los datos se restablecen automáticamente a su estado original limpio.
