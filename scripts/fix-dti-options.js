// Script para actualizar las opciones del campo de DTI
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDTIOptions() {
  console.log('🔧 Actualizando opciones del campo de DTI...\n');

  // Opciones para DTI
  const dtiOptions = [
    "cable HDMI",
    "proyector",
    "computadora",
    "impresora",
    "internet/red",
    "software",
    "hardware",
    "audio/micrófono",
    "pizarra digital"
  ];

  // Actualizar el campo select de DTI
  const { data, error } = await supabase
    .from('area_fields')
    .update({
      options: JSON.stringify(dtiOptions)
    })
    .eq('area_id', 7)
    .eq('field_type', 'select')
    .select();

  if (error) {
    console.error('❌ Error al actualizar:', error);
    return;
  }

  console.log('✅ Opciones de DTI actualizadas exitosamente:');
  console.log(JSON.stringify(dtiOptions, null, 2));
  console.log('\n🎯 Ahora el chatbot detectará correctamente DTI cuando mencionen:');
  console.log('   - cable HDMI');
  console.log('   - proyector');
  console.log('   - computadora');
  console.log('   - impresora');
  console.log('   - internet/red');
  console.log('   - software');
  console.log('   - hardware');
  console.log('   - audio/micrófono');
  console.log('   - pizarra digital');
}

fixDTIOptions().catch(console.error);
