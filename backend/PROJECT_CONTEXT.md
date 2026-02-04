# PROJECT_CONTEXT.md

## 1. ROL Y OBJETIVO
Actúa como un Ingeniero de Software Full Stack Senior especializado en el stack PERN (PostgreSQL/Supabase, Express/Flask, React, Node). Tu objetivo es ayudarme a desarrollar el módulo de **MAQUINARIA** para el sistema de gestión de la empresa "EcoPolo Argentina S.A.".

## 2. STACK TECNOLÓGICO
* **Frontend:** React.js (Componentes funcionales, Hooks).
* **Backend:** Python con Flask.
* **Base de Datos:** Supabase (PostgreSQL).
* **ORM:** SQLAlchemy (o cliente directo de Supabase si es necesario, pero preferimos SQLAlchemy para manejo de modelos).
* **Estilo:** CSS Modules o Librería de UI estándar (Bootstrap/MUI) - *Asumir diseño responsive*.

## 3. MÓDULO ACTUAL: GESTIÓN DE MAQUINARIA
Debemos desarrollar una vista principal que contenga 3 pestañas (Tabs) funcionales:

### TAB 1: GESTIONAR (ABM Máquinas)
CRUD completo de las máquinas de la planta.
* **Listado:** Tabla con nombre, descripción, estado y sector.
* **Acciones:** Crear, Editar, Eliminar (Soft delete o cambio de estado).
* **Estados:** 0=Inactiva, 1=Activa, 2=En Reparación.

### TAB 2: MANTENIMIENTOS (Critical Path)
Gestión de los informes técnicos de mantenimiento.
* **Requerimiento CRÍTICO de Arquitectura:** Los informes de mantenimiento son archivos PDF, se pueden guardar de la forma mas optima en supabase.
* **Descarga:** Debe haber un botón para descargar/visualizar el PDF.

### TAB 3: REPORTES
Dashboard visual simple.
* Historial de mantenimientos por máquina.
* Métricas simples (ej: cantidad de máquinas activas vs. en reparación).

## 4. ESQUEMA DE BASE DE DATOS (Adaptado a Supabase/PostgreSQL)
Basado en el diagrama ER original (MySQL) pero migrado a PostgreSQL. Genera los modelos respetando estas estructuras:

**Tabla: `maquinaria`**
* `id_maquinaria` (PK, Serial/Integer)
* `nombre` (Varchar)
* `anio` (Text)
* `estado` (SmallInt) -> [0, 1, 2]
* `fecha_adquisicion` (Date, opcional)

**Tabla: `InformeMantenimiento`**
* `idInformeMantenimiento` (PK, Int)
* `Fecha` (Date/Datetime)
* `Nombre` (Varchar) -> *Nota: En el diagrama figura como 'Nombre', no 'Titulo'*
* `Archivo` (BLOB / BYTEA) -> **Columna para guardar el PDF.**
* `Estado` (Int/TinyInt)
* `Maquinaria_idMaquinaria` (FK) -> Relación con tabla Maquinaria

**Tabla: `Proveedores`**
* `idProveedores` (PK, Int)
* `Nombre` (Varchar)
* `Estado` (Int)
* `Numero` (Int)

**Tabla: `OperacionSobreMaquina`** (Tabla intermedia si la usamos)
* `Maquinaria_idMaquinaria` (FK)
* `Proveedores_idProveedores` (FK)
* `Fecha` (Date)

## 5. REGLAS DE DESARROLLO
1.  **Backend:** Crea endpoints RESTful claros (`/api/maquinarias`, `/api/mantenimientos`).
2.  **Manejo de Archivos:** Implementa la lógica en Flask para leer el `request.files['file']`, extraer los bytes y pasarlos al modelo.
3.  **Frontend:** Usa `FormData` para enviar el archivo al backend.
4.  **Validaciones:** Validar que el archivo subido sea estrictamente PDF.

## 6. INSTRUCCIÓN INICIAL
Por favor, comienza analizando este contexto.
1.  Primero, dame el script SQL para crear las tablas en Supabase asegurando el tipo de dato correcto para el PDF.
2.  Segundo, genera los Modelos de SQLAlchemy para `Maquinaria` e `InformeMantenimiento`.
3.  Tercero, crea el endpoint de Flask para subir el mantenimiento (POST) manejando la conversión a bytes.