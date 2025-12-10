// Script para buscar tabla de administradores
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  console.log('🔍 Buscando tabla de administradores...\n');

  const tables = ['administradores', 'admins', 'admin', 'administrador', 'data_users'];

  for (const table of tables) {
    console.log(`Probando tabla: ${table}`);
    const { data, error } = await supabase.from(table).select('*').limit(5);

    if (!error) {
      console.log(`\n✅ ¡Tabla '${table}' encontrada!\n`);
      console.log(`Total de registros: ${data.length}`);

      if (data && data.length > 0) {
        console.log('Columnas disponibles:', Object.keys(data[0]));
        console.log('\n📋 Usuarios encontrados:');
        data.forEach((user, index) => {
          console.log(`\n${index + 1}. Usuario:`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Nombre: ${user.nombre || user.name || user.estudiante || 'N/A'}`);
          console.log(`   Email: ${user.email || user.correo || 'N/A'}`);
          console.log(`   Rol: ${user.rol || user.role || 'N/A'}`);
        });
      }

      // Buscar específicamente "black"
      console.log('\n\n🔍 Buscando usuario "black"...');
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      const nameColumn = columns.find(col =>
        col.toLowerCase().includes('name') ||
        col.toLowerCase().includes('nombre') ||
        col.toLowerCase().includes('estudiante')
      );

      if (nameColumn) {
        const { data: blackUser } = await supabase
          .from(table)
          .select('*')
          .ilike(nameColumn, '%black%');

        if (blackUser && blackUser.length > 0) {
          console.log('✅ Usuario BLACK encontrado:');
          blackUser.forEach(user => {
            console.log(`   ID: ${user.id}`);
            console.log(`   Nombre: ${user[nameColumn]}`);
            console.log(`   Email: ${user.email || user.correo || 'N/A'}`);
          });
        } else {
          console.log('⚠️ No se encontró usuario "black" en esta tabla');
        }
      }

      return; // Salir cuando encontremos la tabla
    }
  }

  console.log('\n❌ No se encontró ninguna tabla de administradores');
  console.log('Tablas probadas:', tables.join(', '));
}

checkAdmins().catch(console.error);
