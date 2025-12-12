# 🗑️ Lista de Archivos para Eliminar

## ✅ Archivos Seguros para Eliminar

### 📄 Archivos de Documentación Temporal (Creados para solucionar problemas)

```bash
# Archivos en la raíz del proyecto
EJECUTAR_AHORA.md
IMPORTANTE_EJECUTAR_SQL.md
SOLUCION_ERROR_ADMINISTRADORES.md
```

**Razón:** Estos archivos fueron creados temporalmente para guiar la solución de problemas con la tabla `administradores`. Ya no son necesarios.

---

### 🗄️ Archivos SQL Obsoletos o Temporales

```bash
# Carpeta sql/
sql/fix_administradores_rls.sql
sql/cleanup_administradores_references.sql
sql/IDENTIFICAR_PROBLEMA.sql
sql/SOLUCION_URGENTE.sql
```

**Razón:**
- `fix_administradores_rls.sql`: La tabla `administradores` ya no existe
- `cleanup_administradores_references.sql`: Script ya ejecutado
- `IDENTIFICAR_PROBLEMA.sql`: Script de diagnóstico temporal
- `SOLUCION_URGENTE.sql`: Script de emergencia ya ejecutado

---

### 🔧 Scripts de JavaScript Temporales

```bash
# Carpeta scripts/
scripts/fix-alumno-id-nullable.js
scripts/fix-dti-options.js
scripts/restore-dti-to-default.js
```

**Razón:**
- `fix-alumno-id-nullable.js`: Fix ya aplicado directamente en SQL
- `fix-dti-options.js`: Fix específico ya resuelto
- `restore-dti-to-default.js`: Script de restauración ya usado

---

### 📦 Carpeta dist/ (Si está versionada en Git)

```bash
# Si dist/ está en tu repositorio Git, elimínala
dist/
```

**Razón:** La carpeta `dist/` contiene archivos compilados que se generan automáticamente con `npm run build`. No deben estar en el control de versiones (ya está en `.gitignore`).

Para eliminar de Git (si está versionada):
```bash
git rm -r --cached dist/
```

---

## 📋 Archivos que DEBES MANTENER

### ✅ SQL Importantes
- `sql/add_docente_reports_fields.sql` ✅ (Estructura para reportes de docentes)
- `sql/create_docentes_table.sql` ✅ (Creación de tabla docentes)
- `sql/fix_foreign_key_docentes.sql` ✅ (Permite alumno_id NULL)

### ✅ Scripts de Verificación Útiles
- `scripts/check-admins.js` ✅ (Verifica usuarios admin)
- `scripts/check-areas.js` ✅ (Verifica áreas)
- `scripts/check-area-structure.js` ✅ (Verifica estructura)
- `scripts/check-dti-field-details.js` ✅ (Verifica campos DTI)
- `scripts/check-selection-options.js` ✅ (Verifica opciones)

### ✅ Scripts de Deployment
- `scripts/check-deployment.sh` ✅
- `scripts/clean-project.sh` ✅
- `scripts/deploy-docker.sh` ✅
- `scripts/deploy-netlify.sh` ✅
- `scripts/deploy-vercel.sh` ✅

### ✅ Documentación del Chatbot
- `docs-chatbot-reference/` ✅ (Toda la carpeta - documentación importante)
- `src/features/chatbot/README.md` ✅

---

## 🚀 Comando para Eliminar Todo de una Vez

**⚠️ IMPORTANTE:** Revisa la lista antes de ejecutar. Haz un backup o commit antes de eliminar.

### Windows (PowerShell):
```powershell
# Archivos de documentación temporal
Remove-Item "EJECUTAR_AHORA.md" -ErrorAction SilentlyContinue
Remove-Item "IMPORTANTE_EJECUTAR_SQL.md" -ErrorAction SilentlyContinue
Remove-Item "SOLUCION_ERROR_ADMINISTRADORES.md" -ErrorAction SilentlyContinue

# Archivos SQL obsoletos
Remove-Item "sql/fix_administradores_rls.sql" -ErrorAction SilentlyContinue
Remove-Item "sql/cleanup_administradores_references.sql" -ErrorAction SilentlyContinue
Remove-Item "sql/IDENTIFICAR_PROBLEMA.sql" -ErrorAction SilentlyContinue
Remove-Item "sql/SOLUCION_URGENTE.sql" -ErrorAction SilentlyContinue

# Scripts temporales
Remove-Item "scripts/fix-alumno-id-nullable.js" -ErrorAction SilentlyContinue
Remove-Item "scripts/fix-dti-options.js" -ErrorAction SilentlyContinue
Remove-Item "scripts/restore-dti-to-default.js" -ErrorAction SilentlyContinue
```

### Linux/Mac (Bash):
```bash
# Archivos de documentación temporal
rm -f EJECUTAR_AHORA.md IMPORTANTE_EJECUTAR_SQL.md SOLUCION_ERROR_ADMINISTRADORES.md

# Archivos SQL obsoletos
rm -f sql/fix_administradores_rls.sql sql/cleanup_administradores_references.sql sql/IDENTIFICAR_PROBLEMA.sql sql/SOLUCION_URGENTE.sql

# Scripts temporales
rm -f scripts/fix-alumno-id-nullable.js scripts/fix-dti-options.js scripts/restore-dti-to-default.js
```

---

## 📊 Resumen

| Categoría | Archivos a Eliminar | Espacio Estimado |
|-----------|---------------------|------------------|
| Documentación temporal | 3 archivos | ~15 KB |
| SQL obsoletos | 4 archivos | ~20 KB |
| Scripts temporales | 3 archivos | ~10 KB |
| **TOTAL** | **10 archivos** | **~45 KB** |

---

## ✅ Después de Eliminar

1. **Verifica que todo funcione:**
   ```bash
   npm run dev
   ```

2. **Commit los cambios:**
   ```bash
   git add .
   git commit -m "Limpieza: Eliminar archivos temporales y obsoletos"
   ```

3. **Si eliminaste dist/ de Git:**
   ```bash
   git rm -r --cached dist/
   git add .gitignore
   git commit -m "Remover dist/ del control de versiones"
   ```

---

**Fecha de creación:** 2025-12-12
**Auto-eliminar este archivo después de limpiar:** Sí ✅
