// Script para verificar estructura de áreas y usuarios
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  console.log('🔍 Verificando estructura de áreas y usuarios...\n');

  // 1. Verificar estructura de áreas
  console.log('📋 1. Estructura de la tabla "areas":');
  const { data: areas, error: areasError } = await supabase
    .from('areas')
    .select('*')
    .limit(1);

  if (!areasError && areas && areas.length > 0) {
    console.log('   Columnas disponibles:', Object.keys(areas[0]));
    console.log('   Ejemplo:', areas[0]);
  }

  // 2. Verificar si hay tabla de usuarios
  console.log('\n👤 2. Verificando tabla de usuarios:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (!usersError && users) {
    console.log('   ✅ Tabla "users" existe');
    if (users.length > 0) {
      console.log('   Columnas:', Object.keys(users[0]));
    }
  } else {
    console.log('   ⚠️ Tabla "users" no existe o no tiene datos');
    console.log('   Error:', usersError?.message);
  }

  // 3. Verificar tabla de administradores
  console.log('\n👨‍💼 3. Verificando administradores:');
  const { data: admins, error: adminsError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'admin');

  if (!adminsError && admins) {
    console.log('   Administradores encontrados:', admins.length);
    admins.forEach(admin => {
      console.log(`   - ${admin.name || admin.email} (${admin.role})`);
    });
  }

  // 4. Buscar al usuario "black"
  console.log('\n🔍 4. Buscando usuario "black":');
  const { data: blackUser, error: blackError } = await supabase
    .from('users')
    .select('*')
    .or('name.ilike.%black%,email.ilike.%black%,username.ilike.%black%');

  if (!blackError && blackUser && blackUser.length > 0) {
    console.log('   ✅ Usuario(s) encontrado(s):');
    blackUser.forEach(user => {
      console.log(`   - ID: ${user.id}`);
      console.log(`     Nombre: ${user.name || 'N/A'}`);
      console.log(`     Email: ${user.email || 'N/A'}`);
      console.log(`     Role: ${user.role || 'N/A'}`);
    });
  } else {
    console.log('   ⚠️ No se encontró usuario "black"');
  }

  // 5. Verificar si hay tabla de notificaciones
  console.log('\n🔔 5. Verificando tabla de notificaciones:');
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);

  if (!notifError && notifications !== null) {
    console.log('   ✅ Tabla "notifications" existe');
  } else {
    console.log('   ⚠️ Tabla "notifications" no existe');
    console.log('   Necesitaremos crearla');
  }

  console.log('\n✅ Verificación completada');
}

checkStructure().catch(console.error);
