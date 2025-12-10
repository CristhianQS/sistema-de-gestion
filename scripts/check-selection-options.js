// Script para ver las opciones configuradas en selection_options
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSelectionOptions() {
  console.log('🔍 Verificando opciones configuradas en selection_options...\n');

  // Obtener todas las áreas
  const { data: areas, error: areasError } = await supabase
    .from('areas')
    .select('id, name')
    .order('id');

  if (areasError) {
    console.error('❌ Error:', areasError);
    return;
  }

  // Para cada área, ver sus opciones
  for (const area of areas) {
    const { data: options, error: optionsError } = await supabase
      .from('selection_options')
      .select('*')
      .eq('area_id', area.id)
      .order('group_name, order_index');

    if (optionsError) {
      console.error(`❌ Error para ${area.name}:`, optionsError);
      continue;
    }

    if (options && options.length > 0) {
      console.log(`\n📋 Área: "${area.name}" (ID: ${area.id})`);

      // Agrupar por group_name
      const groups = {};
      options.forEach(opt => {
        if (!groups[opt.group_name]) {
          groups[opt.group_name] = [];
        }
        groups[opt.group_name].push(opt);
      });

      Object.keys(groups).forEach(groupName => {
        console.log(`\n   📦 Grupo: "${groupName}"`);
        groups[groupName].forEach(opt => {
          console.log(`      - ${opt.option_label} (value: ${opt.option_value})`);
        });
      });
    } else {
      console.log(`\n📋 Área: "${area.name}" (ID: ${area.id}) - Sin opciones configuradas`);
    }
  }

  console.log('\n✅ Verificación completada');
}

checkSelectionOptions().catch(console.error);
