// Script para restaurar el campo de DTI a usar las opciones configuradas
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreDTIField() {
  console.log('🔧 Restaurando campo de DTI para usar opciones configuradas...\n');

  // Restaurar el campo a usar "default"
  const { data, error } = await supabase
    .from('area_fields')
    .update({
      options: 'default'
    })
    .eq('area_id', 7)
    .eq('field_type', 'select')
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Campo restaurado exitosamente!');
  console.log('\n📋 Ahora el campo "opciones" de DTI usará las opciones que tú configuras en:');
  console.log('   Administración → Gestión de Áreas → DTI → Opciones disponibles\n');

  console.log('✅ Opciones actuales configuradas:');
  console.log('   - HDMI');
  console.log('   - router');
  console.log('   - cable');
  console.log('   - Otros\n');

  console.log('💡 Para agregar más opciones:');
  console.log('   1. Ve al panel de administración');
  console.log('   2. Edita el área DTI');
  console.log('   3. Agrega nuevas opciones en "Opciones disponibles"');
  console.log('   4. Las opciones aparecerán automáticamente en el formulario ✅');
}

restoreDTIField().catch(console.error);
