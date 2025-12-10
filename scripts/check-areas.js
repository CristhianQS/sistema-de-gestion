// Script para verificar áreas y sus campos en Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAreasAndFields() {
  console.log('🔍 Verificando áreas y campos...\n');

  // Obtener todas las áreas
  const { data: areas, error: areasError } = await supabase
    .from('areas')
    .select('*')
    .order('id');

  if (areasError) {
    console.error('❌ Error al obtener áreas:', areasError);
    return;
  }

  console.log(`✅ Se encontraron ${areas.length} áreas:\n`);

  // Para cada área, obtener sus campos
  for (const area of areas) {
    console.log(`📋 Área: "${area.name}" (ID: ${area.id})`);
    console.log(`   Descripción: ${area.description || 'Sin descripción'}`);

    const { data: fields, error: fieldsError } = await supabase
      .from('area_fields')
      .select('*')
      .eq('area_id', area.id)
      .order('order_index');

    if (fieldsError) {
      console.error(`   ❌ Error al obtener campos:`, fieldsError);
      continue;
    }

    if (fields.length === 0) {
      console.log('   ⚠️  No tiene campos configurados\n');
      continue;
    }

    console.log(`   ✅ Campos (${fields.length}):`);
    fields.forEach((field, index) => {
      console.log(`      ${index + 1}. ${field.field_label} (${field.field_type})`);

      if (field.field_type === 'select' && field.options) {
        try {
          const options = typeof field.options === 'string'
            ? JSON.parse(field.options)
            : field.options;
          console.log(`         Opciones: ${JSON.stringify(options)}`);
        } catch (e) {
          console.log(`         Opciones (raw): ${field.options}`);
        }
      }

      if (field.placeholder) {
        console.log(`         Placeholder: "${field.placeholder}"`);
      }
    });
    console.log('');
  }

  console.log('\n✅ Verificación completada');
}

checkAreasAndFields().catch(console.error);
