# 🏭 Sistema de Gestión Ecopolo - Seminario

Plataforma integral para la gestión operativa y administrativa. Este sistema utiliza una arquitectura **Client-Server** moderna, separando la lógica de negocio (API) de la interfaz de usuario.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js + Vite.
* **Backend:** Python Flask + SQLAlchemy.
* **Base de Datos:** PostgreSQL (Alojada en **Supabase**).
* **Autenticación:** Supabase Auth (Manejo de tokens y seguridad).
* **Infraestructura:** Monorepo (Back y Front en el mismo repositorio).

---

## 📂 Estructura del Proyecto

```text
SEMINARIO/
├── backend/            # Lógica del Servidor (Flask)
│   ├── models/         # Definición de Tablas (SQLAlchemy)
│   ├── routes/         # Endpoints de la API (Login, Usuarios)
│   ├── utils/          # Conexión a Supabase (auth.py)
│   ├── index.py        # Punto de entrada de la app
│   └── requirements.txt
│
├── frontend/           # Interfaz de Usuario (React + Vite)
│   ├── src/
│   │   ├── pages/      # Vistas (Login, Home, RecuperarClave)
│   │   ├── mocks/      # Datos de prueba para Planta/Mantenimiento
│   │   └── main.jsx
│   └── vite.config.js
│
└── README.md


python index.py
Backend
# El servidor correrá en: http://localhost:5000

npm run dev
Frontend
# La web se abrirá en: http://localhost:5173