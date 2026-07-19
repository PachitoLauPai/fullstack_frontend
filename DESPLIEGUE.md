# Guía de Despliegue - Sistema de Visitas Inopinadas

Este documento proporciona las instrucciones paso a paso para configurar y desplegar tanto el backend (Spring Boot) como el frontend (Next.js) del **Sistema de Visitas Inopinadas**.

---

## 1. Arquitectura del Proyecto

El sistema se compone de tres elementos principales:
1. **Base de Datos (MySQL)**: Almacenamiento de catálogos, registros de visitas, evaluaciones y usuarios.
2. **Backend API (Spring Boot)**: Desarrollado en Java 21, expone servicios REST, maneja la lógica de negocio, autenticación JWT, envío de correos de notificación y generación de reportes en PDF.
3. **Frontend (Next.js)**: Desarrollado en Next.js 16 (React 19, TypeScript, Tailwind CSS), interfaz de usuario responsiva para administradores, auditores y docentes.

---

## 2. Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de iniciar:

*   **Java Development Kit (JDK) 21** o superior.
*   **Apache Maven 3.9+** (opcional, ya que se incluye el script `mvnw`).
*   **Node.js 18+** y **npm** (versión recomendada LTS).
*   **MySQL Server 8.0+**.
*   **Git** para el control de versiones.
*   (Opcional) **Docker** y **Docker Compose** si deseas un despliegue contenedorizado.

---

## 3. Paso 1: Configuración de la Base de Datos

El backend necesita conectarse a una base de datos MySQL. Sigue estos pasos para prepararla:

1.  **Crear la base de datos y cargar el esquema:**
    Abre una terminal o tu gestor de base de datos MySQL favorito (como DBeaver o MySQL Workbench) y ejecuta el script [bd.sql](file:///c:/Users/quisp/Documents/GitHub/fullstack-backend/bd.sql). Este script se encarga de:
    *   Crear la base de datos `db_visitas_inopinadas`.
    *   Definir todas las tablas maestras, de negocio y relaciones necesarias.
    *   Insertar datos iniciales (roles, universidades base, usuarios iniciales y visitas de ejemplo).

    ```bash
    mysql -u tu_usuario -p < bd.sql
    ```

2.  **Usuarios iniciales de prueba creados por el script:**
    El script inserta los siguientes accesos por defecto (contraseña para todos: `password`):
    *   **Administrador:** `admin@universidad.edu.pe`
    *   **Auditor:** `v.guadalupe@universidad.edu.pe`
    *   **Docente:** `m.huerta@universidad.edu.pe`

---

## 4. Paso 2: Despliegue del Backend (API REST)

El backend expone servicios en el puerto `8080` (por defecto) y requiere ciertas variables de entorno para conectarse a la base de datos.

### A. Variables de Entorno Requeridas
Debes configurar las siguientes variables de entorno en el servidor de despliegue:

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `DB_HOST` | Host del servidor MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `db_visitas_inopinadas` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD`| Contraseña de MySQL | `tu_contraseña` |
| `PORT` | Puerto de escucha de la aplicación | `8080` |

> [!WARNING]
> **Seguridad de Credenciales SMTP:**
> Actualmente, las credenciales SMTP para el envío de correos mediante Gmail están configuradas directamente en el archivo `application.properties`. Para producción, se recomienda parametrizar estas propiedades (por ejemplo, `spring.mail.username=${MAIL_USER}` y `spring.mail.password=${MAIL_PASSWORD}`) para evitar exponer credenciales sensibles en el código fuente.

### B. Ejecución en Modo Desarrollo (Local)
Para ejecutar la aplicación localmente sin Docker:
```bash
# Navegar a la carpeta del backend
cd fullstack-backend

# Ejecutar con Maven Wrapper
./mvnw spring-boot:run
```

### C. Construcción y Ejecución en Producción (Manual)
1.  **Compilar el archivo JAR:**
    ```bash
    ./mvnw clean package -DskipTests
    ```
    Esto generará el archivo ejecutable `.jar` en la carpeta `target/`.

2.  **Ejecutar el JAR compilado:**
    ```bash
    java -Xmx512m -jar target/backend-api-0.0.1-SNAPSHOT.jar
    ```

### D. Despliegue en la Nube usando Docker (Ej. Render / Railway)
El backend incluye un [Dockerfile](file:///c:/Users/quisp/Documents/GitHub/fullstack-backend/Dockerfile) optimizado para despliegues en plataformas como Render o Railway.

1.  **Crear un nuevo servicio en la nube (Web Service en Render):**
    *   Conecta tu repositorio de GitHub.
    *   Selecciona el entorno de ejecución como **Docker**.
2.  **Configurar Variables de Entorno (Environment Variables):**
    *   Agrega `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
3.  **Configurar Almacenamiento Persistente (IMPORTANTE):**
    El backend almacena las evidencias subidas en la carpeta local `uploads/evidencias/`. Al desplegar en contenedores efímeros (como los de Render o Railway), los archivos subidos se perderán cada vez que el servicio se reinicie.
    *   **Solución:** Debes montar un disco persistente (Persistent Volume) en el contenedor.
    *   **Ruta de montaje en el contenedor:** `/app/uploads`
    *   **Tamaño recomendado:** 1 GB o más según tus necesidades.

---

## 5. Paso 3: Despliegue del Frontend (Next.js)

El frontend está desarrollado sobre Next.js y consume los servicios del Backend.

### A. Variable de Entorno Requerida (Build Time)
Next.js requiere saber la URL del backend durante el proceso de compilación para inyectarla en el bundle del cliente:

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL de la API del Backend | `https://tu-backend.com/api` o `http://localhost:8080/api` |

> [!IMPORTANT]
> Debido a que las variables con el prefijo `NEXT_PUBLIC_` se compilan dentro del código JavaScript del lado del cliente en Next.js, **debes configurar esta variable en el entorno de construcción (Build Environment Variables)** del proveedor de hosting antes de iniciar la compilación.

### B. Ejecución en Modo Desarrollo (Local)
1.  Crea un archivo `.env.local` en la raíz del frontend:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080/api
    ```
2.  Instala las dependencias e inicia el servidor de desarrollo:
    ```bash
    cd fullstack_frontend
    npm install
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

### C. Despliegue en la Nube (Vercel / Netlify / Render)
El despliegue en Vercel es altamente recomendado para Next.js debido a su compatibilidad nativa.

1.  **Crear Proyecto en Vercel:**
    *   Importa tu repositorio de GitHub `fullstack_frontend`.
2.  **Configurar Variables de Entorno:**
    *   Añade `NEXT_PUBLIC_API_URL` apuntando a la URL pública de tu API del backend (por ejemplo: `https://sistema-visitas-backend.onrender.com/api`).
3.  **Configuración de Construcción:**
    *   **Framework Preset:** Next.js (detectado automáticamente).
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `.next`
4.  Haz clic en **Deploy**. Vercel se encargará de compilar la aplicación y proveer una URL pública HTTPS para el frontend.

---

## 6. Consideraciones de Seguridad y Producción

*   **HTTPS/SSL:** Configura certificados SSL para el backend y el frontend. Los navegadores modernos bloquean peticiones HTTP inseguras desde sitios HTTPS (Mixed Content).
*   **CORS (Cross-Origin Resource Sharing):** Asegúrate de que el backend permita peticiones provenientes del dominio del frontend. En Spring Boot esto se configura usualmente en una clase de seguridad o anotando los controladores con `@CrossOrigin`.
*   **Rotación del JWT Secret:** En producción, cambia el secreto del JWT por una cadena robusta generada de manera aleatoria.
*   **Copias de Seguridad de la Base de Datos:** Configura respaldos automáticos diarios para la base de datos MySQL y la carpeta `/app/uploads`.
