# 📝 Ejemplo: Cómo Agregar la Campanita a tus Reportes

## 🎯 Objetivo

Agregar el indicador de revisión (campanita) a tus listas de reportes existentes.

---

## ✅ Paso a Paso

### 1. **Importar el Componente**

```tsx
import ReviewIndicator from '../components/ReviewIndicator';
import { markAsReviewed } from '../services/database/submissions.service';
```

### 2. **Agregar Estado para User Email**

```tsx
const [userEmail, setUserEmail] = useState('admin@upeu.edu.pe'); // Email del usuario logueado
```

### 3. **Actualizar la Consulta de Reportes**

Asegúrate de que la consulta incluya los campos de revisión:

```tsx
const { data: reportesData } = await supabase
  .from('area_submissions')
  .select('*, reviewed, reviewed_at, reviewed_by') // ✅ Incluir campos
  .order('submitted_at', { ascending: false});
```

### 4. **Crear Función para Marcar como Revisado**

```tsx
const handleMarkAsReviewed = async (reporteId: number) => {
  try {
    await markAsReviewed(reporteId, userEmail);
    // Recargar reportes
    await loadReportes();
    console.log('✅ Reporte marcado como revisado');
  } catch (error) {
    console.error('Error al marcar como revisado:', error);
  }
};
```

### 5. **Agregar Campanita en la UI**

#### **Opción A: En una Tabla**

```tsx
<table>
  <thead>
    <tr>
      <th>Estado</th> {/* ← NUEVA COLUMNA */}
      <th>Área</th>
      <th>Estudiante</th>
      <th>Fecha</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {reportes.map(reporte => (
      <tr key={reporte.id}>
        {/* NUEVA CELDA CON CAMPANITA */}
        <td>
          <button onClick={() => handleMarkAsReviewed(reporte.id)}>
            <ReviewIndicator
              reviewed={reporte.reviewed || false}
              reviewedAt={reporte.reviewed_at}
              reviewedBy={reporte.reviewed_by}
              size="md"
            />
          </button>
        </td>

        <td>{reporte.area_nombre}</td>
        <td>{reporte.alumno_nombre}</td>
        <td>{new Date(reporte.submitted_at).toLocaleDateString()}</td>
        <td>
          <button onClick={() => viewDetails(reporte)}>Ver</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

#### **Opción B: En una Card**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {reportes.map(reporte => (
    <div key={reporte.id} className="bg-white rounded-lg shadow p-4">
      {/* Header con campanita */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">{reporte.area_nombre}</h3>

        {/* CAMPANITA AQUÍ */}
        <button onClick={() => handleMarkAsReviewed(reporte.id)}>
          <ReviewIndicator
            reviewed={reporte.reviewed || false}
            reviewedAt={reporte.reviewed_at}
            reviewedBy={reporte.reviewed_by}
            size="lg"
          />
        </button>
      </div>

      {/* Resto de la info */}
      <p className="text-gray-600">{reporte.alumno_nombre}</p>
      <p className="text-sm text-gray-400">
        {new Date(reporte.submitted_at).toLocaleDateString()}
      </p>
    </div>
  ))}
</div>
```

---

## 🎨 Ejemplo Completo

```tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ReviewIndicator from '../components/ReviewIndicator';
import { markAsReviewed } from '../services/database/submissions.service';

interface Reporte {
  id: number;
  area_nombre: string;
  alumno_nombre: string;
  submitted_at: string;
  reviewed: boolean;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

const ReportesList: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const userEmail = 'admin@upeu.edu.pe'; // Email del usuario logueado

  const loadReportes = async () => {
    const { data } = await supabase
      .from('area_submissions')
      .select(`
        *,
        reviewed,
        reviewed_at,
        reviewed_by,
        area:areas(name)
      `)
      .order('submitted_at', { ascending: false });

    setReportes(data?.map(r => ({
      id: r.id,
      area_nombre: r.area?.name || 'Sin área',
      alumno_nombre: r.alumno_nombre,
      submitted_at: r.submitted_at,
      reviewed: r.reviewed || false,
      reviewed_at: r.reviewed_at,
      reviewed_by: r.reviewed_by
    })) || []);
  };

  const handleMarkAsReviewed = async (id: number) => {
    await markAsReviewed(id, userEmail);
    await loadReportes();
  };

  useEffect(() => {
    loadReportes();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reportes</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Área</th>
              <th className="px-4 py-3 text-left">Estudiante</th>
              <th className="px-4 py-3 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map(reporte => (
              <tr key={reporte.id} className="border-t">
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleMarkAsReviewed(reporte.id)}
                    className="hover:opacity-75 transition-opacity"
                  >
                    <ReviewIndicator
                      reviewed={reporte.reviewed}
                      reviewedAt={reporte.reviewed_at}
                      reviewedBy={reporte.reviewed_by}
                    />
                  </button>
                </td>
                <td className="px-4 py-3">{reporte.area_nombre}</td>
                <td className="px-4 py-3">{reporte.alumno_nombre}</td>
                <td className="px-4 py-3">
                  {new Date(reporte.submitted_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesList;
```

---

## 🎯 Props del Componente ReviewIndicator

```tsx
interface ReviewIndicatorProps {
  reviewed: boolean;                // ¿Está revisado?
  reviewedAt?: string | null;       // Fecha de revisión
  reviewedBy?: string | null;       // Quién lo revisó
  showTooltip?: boolean;            // Mostrar tooltip (default: true)
  size?: 'sm' | 'md' | 'lg';       // Tamaño (default: 'md')
}
```

---

## 📊 Estados Visuales

### **No Revisado**
```
🔔 ← Roja, parpadeante
     Al hacer hover: "🔔 Pendiente de revisar"
```

### **Revisado**
```
🔔✓ ← Verde con checkmark
      Al hacer hover:
      "✅ Revisado
       📅 10/12/2025 14:30
       👤 admin@upeu.edu.pe"
```

---

## ✅ Checklist

- [ ] Importar `ReviewIndicator`
- [ ] Importar `markAsReviewed` del servicio
- [ ] Actualizar consulta para incluir campos `reviewed`, `reviewed_at`, `reviewed_by`
- [ ] Crear función `handleMarkAsReviewed`
- [ ] Agregar campanita a la UI
- [ ] Hacer campanita clickeable
- [ ] Probar cambio de estado

---

## 🧪 Probar

1. **Ejecuta el SQL de actualización**
2. **Agrega el componente a tu lista**
3. **Recarga los reportes**
4. **Verifica campanitas rojas en reportes nuevos**
5. **Click en una campanita roja**
6. **Debe cambiar a verde** ✅

---

**¡Listo para usar!** 🚀
