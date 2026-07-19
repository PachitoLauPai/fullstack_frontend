# 🌐 Frontend — Sistema de Visitas Inopinadas

Aplicación web construida con **Next.js 16** + **TypeScript** + **Tailwind CSS** + **shadcn/ui**.

---

## 📋 Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18.17+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ *(incluido con Node.js)* | — |

> Verifica tu versión con: `node -v` y `npm -v`

---

## ⚙️ Configuración inicial

### 1. Instalar dependencias

Desde la carpeta `fullstack_frontend`:

```bash
npm install
```

Esto descargará automáticamente todos los paquetes listados en `package.json` (shadcn/ui, Radix UI, Tailwind, etc.).

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con la URL del backend:

```env
# URL de la API del backend (Spring Boot)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> **Nota:** Si cambias el puerto del backend, actualiza esta variable.

### 3. Colocar el logo institucional

Si tienes el logo de la UTP, colócalo en:

```
public/iconoutp.jpg
```

---

## 🚀 Ejecutar el proyecto

### Modo desarrollo (recomendado)

```bash
npm run dev
```

La aplicación estará disponible en:
```
http://localhost:3000
```

Los cambios en el código se reflejan automáticamente sin reiniciar.

### Modo producción

```bash
# 1. Compilar para producción
npm run build

# 2. Iniciar servidor de producción
npm start
```

---

## ✅ Verificar que está funcionando

1. Abre `http://localhost:3000` en tu navegador
2. Deberías ver la pantalla de login
3. Asegúrate de que el **backend esté corriendo** en `http://localhost:8080`

---

## 📁 Estructura del proyecto

```
fullstack_frontend/
├── app/                    ← Páginas y rutas (Next.js App Router)
│   ├── (dashboard)/        ← Páginas protegidas del dashboard
│   ├── login/              ← Página de inicio de sesión
│   └── layout.tsx          ← Layout raíz con metadatos
├── components/             ← Componentes reutilizables
│   ├── ui/                 ← Componentes shadcn/ui
│   ├── sidebar.tsx         ← Barra lateral de navegación
│   └── visitas/            ← Componentes del módulo de visitas
├── hooks/                  ← React hooks personalizados
├── lib/                    ← Utilidades y contextos
│   ├── auth-context.tsx    ← Contexto de autenticación
│   └── utils.ts            ← Funciones utilitarias
├── services/               ← Servicios de llamadas a la API
├── styles/                 ← Estilos globales
├── public/                 ← Archivos estáticos (imágenes, iconos)
│   └── iconoutp.jpg        ← Logo institucional UTP
├── package.json            ← Dependencias del proyecto
├── next.config.mjs         ← Configuración de Next.js
└── tsconfig.json           ← Configuración de TypeScript
```

---

## 📦 Dependencias principales

| Librería | Uso |
|---|---|
| Next.js 16 | Framework React con App Router |
| React 19 | Librería de interfaz de usuario |
| TypeScript 5.7 | Tipado estático |
| Tailwind CSS 4 | Estilos utilitarios |
| shadcn/ui + Radix UI | Componentes de interfaz accesibles |
| Axios | Peticiones HTTP al backend |
| jwt-decode | Decodificación de tokens JWT |
| React Hook Form + Zod | Formularios con validación |
| Lucide React | Iconos vectoriales |
| Sonner | Notificaciones toast |
| Recharts | Gráficos y estadísticas |
| next-themes | Soporte modo oscuro/claro |
| date-fns | Manejo de fechas |

---

## 🔑 Credenciales de prueba

> Configura los usuarios directamente en la base de datos del backend o usa los que vengan en `bd.sql`.

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con hot-reload |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Inicia el servidor de producción (requiere build previo) |
| `npm run lint` | Ejecuta el linter de código (ESLint) |

---

## ❓ Problemas comunes

| Error | Solución |
|---|---|
| `Cannot find module` | Ejecuta `npm install` nuevamente |
| `Network Error` al hacer login | Verifica que el backend esté corriendo y que `NEXT_PUBLIC_API_URL` sea correcto |
| Puerto 3000 ocupado | Next.js automáticamente usa el siguiente disponible (3001, 3002...) |
| Imagen del logo no aparece | Verifica que `iconoutp.jpg` esté en la carpeta `public/` |
| Error de CORS | Asegúrate de que el backend tenga configurado CORS para `http://localhost:3000` |
