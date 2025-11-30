# Sistema de Gestión Universitaria UPEU

Sistema de gestión integral para la administración de formularios y reportes universitarios con roles jerárquicos y gestión de áreas.

## Características Principales

### Funcionalidades del Sistema
- Sistema de roles jerárquico (Black, Oro, Plata)
- Gestión dinámica de áreas con formularios personalizables
- Sistema de pabellones y salones
- Reportes y seguimiento de envíos de estudiantes
- Subida y gestión de imágenes con Supabase Storage
- Autenticación y autorización por roles
- Interfaz responsiva y moderna

### Mejoras de Arquitectura
- Code Splitting y Lazy Loading para optimización de rendimiento
- Error Boundary para manejo robusto de errores
- Sistema de rutas protegidas con React Router
- Tipos TypeScript centralizados
- Constantes y utilidades compartidas
- Testing configurado con Vitest

## Stack Tecnológico

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript 5.9** - Tipado estático
- **Vite 7** - Build tool y dev server
- **React Router DOM 7** - Enrutamiento
- **Tailwind CSS 3** - Estilos

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Real-time

### Testing
- **Vitest 4** - Framework de testing
- **React Testing Library** - Testing de componentes
- **jsdom** - Simulación de DOM

## Estructura del Proyecto

```
sistema-de-gestion/
├── src/
│   ├── components/          # Componentes React
│   │   ├── modals/         # Componentes de modales
│   │   ├── ErrorBoundary.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── pages/              # Vistas principales
│   │   ├── PublicView.tsx
│   │   ├── VistaBlack.tsx
│   │   ├── VistaOro.tsx
│   │   └── VistaPlata.tsx
│   ├── routes/             # Configuración de rutas
│   │   └── AppRoutes.tsx
│   ├── context/            # Context API
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom Hooks
│   │   ├── useSupabaseUpload.ts
│   │   └── useStudentReports.ts
│   ├── lib/                # Configuración de librerías
│   │   └── supabase.ts
│   ├── types/              # Tipos TypeScript compartidos
│   │   └── index.ts
│   ├── constants/          # Constantes de la aplicación
│   │   └── index.ts
│   ├── utils/              # Funciones de utilidad
│   │   ├── index.ts
│   │   ├── errorHandler.ts
│   │   └── index.test.ts
│   ├── test/               # Configuración de tests
│   │   └── setup.ts
│   ├── App.tsx
│   └── main.tsx
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno (no versionado)
├── .env.example           # Template de variables de entorno
├── vitest.config.ts       # Configuración de Vitest
├── vite.config.ts         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── package.json
```

## Instalación y Configuración

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de Supabase

### Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd sistema-de-gestion
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Supabase
```

Contenido de `.env`:
```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

## Scripts Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5173`

### Build
```bash
npm run build
```
Compila la aplicación para producción en la carpeta `dist/`

### Preview
```bash
npm run preview
```
Previsualiza el build de producción localmente

### Linting
```bash
npm run lint
```
Ejecuta ESLint para verificar el código

### Testing
```bash
# Ejecutar tests
npm test

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

## Roles y Permisos

### Admin Black (Administrador Principal)
- Acceso total al sistema
- Gestión de áreas y campos dinámicos
- Gestión de administradores Oro
- Gestión de pabellones y salones
- Visualización de todos los reportes
- Acceso a datos de alumnos

### Admin Oro (Administrador de Área)
- Gestión de su área asignada
- Administración de usuarios Plata
- Visualización de reportes de su área
- Acceso a datos de alumnos de su área

### Admin Plata (Visualizador)
- Solo lectura
- Acceso limitado a un área específica
- Sin permisos de edición

## Rutas de la Aplicación

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Vista pública con áreas | Público |
| `/admin/black` | Panel de Admin Black | Solo admin_black |
| `/admin/oro` | Panel de Admin Oro | Solo admin_oro |
| `/admin/plata` | Panel de Admin Plata | Solo admin_plata |

## Optimizaciones de Rendimiento

### Code Splitting
Las vistas se cargan de manera lazy para reducir el bundle inicial:
- Bundle principal: ~402 KB
- Vista Black: 61 KB (carga bajo demanda)
- Vista Oro: 14 KB (carga bajo demanda)
- Vista Plata: 5 KB (carga bajo demanda)
- Vista Pública: 32 KB (carga bajo demanda)

### Error Handling
- Error Boundary para capturar errores en toda la aplicación
- Sistema centralizado de manejo de errores
- Mensajes de error user-friendly

## Testing

El proyecto incluye tests unitarios para:
- Funciones de utilidad (formateo, validación, etc.)
- Custom hooks
- Componentes críticos

Ejecutar tests:
```bash
npm test
```

## Seguridad

### Variables de Entorno
- Las credenciales están protegidas en archivos `.env`
- Nunca commitees el archivo `.env` al repositorio
- Usa `.env.example` como referencia

### Autenticación
- Sistema de roles implementado
- Rutas protegidas por nivel de acceso
- Validación de permisos en cada acción

## Tecnologías y Herramientas

- [React](https://react.dev/) - Biblioteca UI
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [Vite](https://vitejs.dev/) - Build tool
- [React Router](https://reactrouter.com/) - Enrutamiento
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vitest](https://vitest.dev/) - Framework de testing
- [Testing Library](https://testing-library.com/) - Testing de componentes

## Licencia

Este proyecto está licenciado bajo los términos especificados por la Universidad UPEU.

---

**Desarrollado para la Universidad Peruana Unión (UPEU)**
