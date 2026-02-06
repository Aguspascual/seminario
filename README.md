# 📂 Documentación del Proyecto - Seminario EcoPolo Argentina S.A.

Sistema de gestión integral para EcoPolo Argentina S.A. desarrollado con stack PERN (PostgreSQL/Supabase, Flask, React, Node).

---

## 🏗️ Estructura General del Proyecto

```
seminario/
├── backend/          # API Flask + SQLAlchemy
├── frontend/         # Aplicación React con Vite
└── .gitignore        # Archivos ignorados por Git
```

---

## 🔧 Backend (Flask + SQLAlchemy + Supabase)

### 📁 Estructura del Backend

```
backend/
├── models/           # Modelos de base de datos (SQLAlchemy)
├── routes/           # Endpoints de la API (Blueprints de Flask)
├── schemas/          # Esquemas de validación (Pydantic/Marshmallow)
├── services/         # Lógica de negocio
├── utils/            # Utilidades (ej: configuración de BD)
├── scripts/          # Scripts auxiliares
├── app.py            # Configuración principal de Flask
├── index.py          # Punto de entrada del servidor
├── requirements.txt  # Dependencias de Python
├── .env              # Variables de entorno (NO COMMITEAR)
├── .env.example      # Ejemplo de variables de entorno
├── .gitignore        # Ignorados de Git para backend
└── PROJECT_CONTEXT.md # Contexto del proyecto y especificaciones
```

### 📄 Archivos Principales

#### `app.py`
**Propósito:** Configuración principal de la aplicación Flask.
- Inicializa Flask y extensiones (CORS, JWT, Swagger)
- Configura la conexión a la base de datos (Supabase/PostgreSQL)
- Registra todos los blueprints (rutas)
- Define el endpoint raíz `/`

#### `index.py`
**Propósito:** Punto de entrada para ejecutar el servidor.
- Inicia la aplicación Flask en modo desarrollo

#### `requirements.txt`
**Propósito:** Lista de todas las dependencias de Python necesarias.
- Flask, SQLAlchemy, Flask-JWT-Extended, Flask-CORS, etc.
- Se instala con: `pip install -r requirements.txt`

#### `.env` / `.env.example`
**Propósito:** Variables de entorno para configuración.
- `DATABASE_URL`: URL de conexión a Supabase
- `JWT_SECRET_KEY`: Clave secreta para tokens JWT
- **IMPORTANTE:** `.env` nunca se commitea, usar `.env.example` como plantilla

#### `PROJECT_CONTEXT.md`
**Propósito:** Documentación técnica del proyecto.
- Especificaciones del módulo de Maquinaria
- Esquema de base de datos
- Reglas de desarrollo

### 📂 Carpeta `models/`

**Propósito:** Definición de modelos de base de datos usando SQLAlchemy ORM.

| Archivo | Descripción |
|---------|-------------|
| `__init__.py` | Inicialización del módulo models |
| `usuario.py` | Modelo de usuarios del sistema |
| `area.py` | Modelo de áreas/sectores de la empresa |
| `proveedor.py` | Modelo de proveedores |
| `tipo_proveedor.py` | Modelo de tipos de proveedores |
| `reporte.py` | Modelo de reportes generados |

**Relaciones:**
- Cada modelo define la estructura de tablas en PostgreSQL
- Incluyen relaciones (ForeignKey, relationships)
- Definen validaciones y constraints

### 📂 Carpeta `routes/`

**Propósito:** Endpoints REST de la API (Blueprints de Flask).

| Archivo | Descripción | Endpoints Principales |
|---------|-------------|-----------------------|
| `login.py` | Autenticación y autorización | `POST /auth/login`, `POST /auth/register` |
| `usuarios.py` | Gestión de usuarios | `GET /usuarios`, `POST /usuarios`, `PUT /usuarios/:id`, `DELETE /usuarios/:id` |
| `proveedores.py` | Gestión de proveedores | `GET /proveedores`, `POST /proveedores`, `PUT /proveedores/:id` |
| `areas.py` | Gestión de áreas | `GET /areas`, `POST /areas`, `PUT /areas/:id` |
| `reportes.py` | Generación y consulta de reportes | `GET /reportes`, `POST /reportes` |

**Características:**
- Cada archivo define un Blueprint de Flask
- Manejan requests/responses HTTP
- Implementan validación de JWT cuando es necesario
- Utilizan decoradores para documentación Swagger

### 📂 Carpeta `schemas/`

**Propósito:** Esquemas de validación para requests/responses.

| Archivo | Descripción |
|---------|-------------|
| `__init__.py` | Inicialización del módulo schemas |
| `usuario_schema.py` | Validaciones para datos de usuarios |
| `login_schema.py` | Validaciones para login/registro |
| `area_schema.py` | Validaciones para áreas |
| `proveedor_schema.py` | Validaciones para proveedores |

**Uso:**
- Validan datos entrantes (requests)
- Serializan datos salientes (responses)
- Previenen inyecciones y datos malformados

### 📂 Carpeta `services/`

**Propósito:** Lógica de negocio separada de las rutas.

| Archivo | Descripción |
|---------|-------------|
| `__init__.py` | Inicialización del módulo services |
| `auth_service.py` | Lógica de autenticación (hash passwords, tokens) |
| `usuario_service.py` | Lógica de negocio para usuarios |
| `proveedor_service.py` | Lógica de negocio para proveedores |
| `area_service.py` | Lógica de negocio para áreas |
| `reporte_service.py` | Generación y procesamiento de reportes |

**Patrón:**
- Separa la lógica de negocio de los endpoints
- Interactúa con los modelos de base de datos
- Retorna datos procesados a las rutas

### 📂 Carpeta `utils/`

**Propósito:** Utilidades y configuraciones compartidas.

- `database.py`: Configuración de SQLAlchemy y conexión a BD

### 📂 Carpeta `scripts/`

**Propósito:** Scripts auxiliares para tareas específicas.
- Scripts de migración, seeders, etc.

---

## 🎨 Frontend (React + Vite)

### 📁 Estructura del Frontend

```
frontend/
├── src/
│   ├── assets/       # Imágenes, iconos, recursos estáticos
│   ├── components/   # Componentes reutilizables
│   ├── pages/        # Páginas principales de la aplicación
│   ├── routes/       # Configuración de rutas
│   ├── validations/  # Validaciones con Yup
│   ├── App.jsx       # Componente principal
│   ├── App.css       # Estilos del App
│   ├── main.jsx      # Punto de entrada de React
│   └── index.css     # Estilos globales
├── public/           # Archivos públicos estáticos
├── index.html        # HTML base
├── package.json      # Dependencias y scripts de Node
├── vite.config.js    # Configuración de Vite
├── eslint.config.js  # Configuración de ESLint
└── .gitignore        # Ignorados de Git para frontend
```

### 📄 Archivos Principales

#### `package.json`
**Propósito:** Configuración del proyecto Node.js.
- **Scripts:**
  - `npm run dev`: Inicia servidor de desarrollo (Vite)
  - `npm run build`: Compilación para producción
  - `npm run lint`: Ejecuta linter ESLint
- **Dependencias:**
  - React 19, React Router, React Hook Form, Yup
  - TanStack Query (para queries HTTP)
  - FontAwesome (iconos)

#### `vite.config.js`
**Propósito:** Configuración del bundler Vite.
- Define plugins (React)
- Configuración de build y dev server

#### `index.html`
**Propósito:** Archivo HTML base de la SPA.
- Punto de montaje de React (`<div id="root">`)

#### `main.jsx`
**Propósito:** Punto de entrada de React.
- Monta el componente `<App />` en el DOM
- Configura proveedores globales (React Query, Router)

#### `App.jsx`
**Propósito:** Componente raíz de la aplicación.
- Define la estructura principal
- Configura React Router

### 📂 Carpeta `src/pages/`

**Propósito:** Páginas principales de la aplicación (cada una es una ruta completa).

| Archivo | Descripción | Ruta |
|---------|-------------|------|
| `Login.jsx` | Página de inicio de sesión | `/login` |
| `Home.jsx` | Dashboard/Inicio | `/` |
| `Usuarios.jsx` | Gestión de usuarios (ABM) | `/usuarios` |
| `Proveedores.jsx` | Gestión de proveedores | `/proveedores` |
| `Areas.jsx` | Gestión de áreas | `/areas` |
| `Reportes.jsx` | Generación y visualización de reportes | `/reportes` |
| `Maquinaria.jsx` | Gestión de maquinaria (3 tabs) | `/maquinaria` |
| `Capacitaciones.jsx` | Gestión de capacitaciones | `/capacitaciones` |
| `Auditorias.jsx` | Auditorías del sistema | `/auditorias` |
| `MiPerfil.jsx` | Perfil del usuario autenticado | `/perfil` |
| `CambiarContraseña.jsx` | Cambio de contraseña | `/cambiar-contrasena` |
| `RecuperarPassword.jsx` | Recuperación de contraseña | `/recuperar-password` |

**Características:**
- Componentes funcionales con hooks
- Formularios con React Hook Form + Yup
- Peticiones HTTP con TanStack Query
- Tablas interactivas con acciones (Editar, Eliminar)

### 📂 Carpeta `src/components/`

**Propósito:** Componentes reutilizables en toda la aplicación.

| Archivo | Descripción |
|---------|-------------|
| `Head.jsx` | Header/Navbar de la aplicación |
| `Footer.jsx` | Footer de la aplicación |
| `PrivateRoute.jsx` | Componente para proteger rutas privadas (requiere autenticación) |

### 📂 Carpeta `src/routes/`

**Propósito:** Configuración de rutas de React Router.
- Define las rutas públicas y privadas
- Maneja redirecciones

### 📂 Carpeta `src/validations/`

**Propósito:** Esquemas de validación con Yup para formularios.
- Validaciones de campos
- Mensajes de error personalizados

### 📂 Carpeta `src/assets/`

**Propósito:** Recursos estáticos (imágenes, logos, iconos).

---

## 🚀 Cómo Empezar

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd seminario
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Copiar .env.example a .env y completar con tus credenciales
cp .env.example .env

# Iniciar servidor Flask
python index.py
```

El backend estará disponible en `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 🗄️ Base de Datos

**Motor:** PostgreSQL (Supabase)

**Tablas Principales:**
- `usuarios`: Usuarios del sistema
- `areas`: Áreas/sectores de la empresa
- `proveedores`: Proveedores
- `tipo_proveedor`: Tipos de proveedores
- `reportes`: Reportes generados
- `maquinaria`: Máquinas de la planta (futuro)
- `InformeMantenimiento`: Informes de mantenimiento (futuro)

---

## 🔐 Autenticación

- **Método:** JWT (JSON Web Tokens)
- **Login:** `POST /auth/login`
- **Registro:** `POST /auth/register`
- **Headers:** `Authorization: Bearer <token>`

---

## 📝 Módulos Implementados

✅ **Usuarios:** ABM completo con roles
✅ **Proveedores:** Gestión de proveedores y tipos
✅ **Áreas:** Gestión de sectores/áreas
✅ **Reportes:** Generación y consulta
✅ **Autenticación:** Login, registro, recuperación
🚧 **Maquinaria:** En desarrollo (ver PROJECT_CONTEXT.md)

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework:** Flask 3.x
- **ORM:** SQLAlchemy
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** Flask-JWT-Extended
- **Validación:** Pydantic/Marshmallow
- **Documentación API:** Flasgger (Swagger)

### Frontend
- **Framework:** React 19
- **Bundler:** Vite 7
- **Routing:** React Router DOM 7
- **Formularios:** React Hook Form + Yup
- **HTTP Client:** TanStack Query (React Query)
- **Iconos:** FontAwesome
- **Linting:** ESLint

---

## 📚 Comandos Útiles

### Backend
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python index.py

# Ver documentación API (Swagger)
# Abrir: http://localhost:5000/apidocs
```

### Frontend
```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Linting
npm run lint

# Preview de build
npm run preview
```

---

## 📞 Información del Proyecto

**Empresa:** EcoPolo Argentina S.A.
**Tipo:** Sistema de Gestión Integral
**Versión:** 2.0
**Estado:** En Desarrollo Activo

---

## 🤝 Contribuir

1. Revisa `PROJECT_CONTEXT.md` para entender el contexto
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Haz commits descriptivos
4. Push a tu rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## ⚠️ Notas Importantes

1. **NO commitear archivos `.env`** - Contienen credenciales sensibles
2. **Backend y Frontend son aplicaciones separadas** - Se ejecutan en puertos diferentes
3. **CORS está habilitado** - Permite comunicación entre frontend y backend
4. **JWT es requerido** - Para la mayoría de endpoints (excepto login/register)

---

**Última actualización:** Febrero 2026
