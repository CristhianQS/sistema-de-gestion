// Script para verificar detalles del campo de DTI
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDTIField() {
  console.log('🔍 Verificando campo de DTI en detalle...\n');

  const { data: fields, error } = await supabase
    .from('area_fields')
    .select('*')
    .eq('area_id', 7)
    .eq('field_type', 'select');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!fields || fields.length === 0) {
    console.log('⚠️  No se encontraron campos SELECT en DTI');
    return;
  }

  console.log('✅ Campo SELECT de DTI:');
  fields.forEach(field => {
    console.log('\n📋 Detalles completos:');
    console.log('   ID:', field.id);
    console.log('   field_name:', field.field_name);
    console.log('   field_label:', field.field_label);
    console.log('   field_type:', field.field_type);
    console.log('   is_required:', field.is_required);
    console.log('   order_index:', field.order_index);
    console.log('   placeholder:', field.placeholder);
    console.log('\n   📝 Options (raw):');
    console.log('   ', field.options);

    console.log('\n   📝 Options (parsed):');
    try {
      const parsed = JSON.parse(field.options);
      console.log('   ', parsed);
    } catch (e) {
      console.log('   ❌ Error al parsear:', e.message);
    }
  });
}

checkDTIField().catch(console.error);
