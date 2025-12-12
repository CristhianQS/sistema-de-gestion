// Script para permitir alumno_id NULL en area_submissions (para reportes de docentes)
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://mimxrygblbuqwnihadpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXhyeWdibGJ1cXduaWhhZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAyNjAsImV4cCI6MjA3Nzk5NjI2MH0.AecwAaBFBasO2z-Of9MAq8FAjFSB4vrO-ImttgglUu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAlumnoIdNullable() {
  console.log('🔧 Ejecutando fix para permitir alumno_id NULL...\n');

  try {
    // Leer el archivo SQL
    const sqlPath = join(__dirname, '../sql/fix_foreign_key_docentes.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Dividir en comandos SQL individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && !cmd.startsWith('/*'));

    console.log(`📋 Ejecutando ${commands.length} comandos SQL...\n`);

    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      // Saltar comentarios y comandos vacíos
      if (!command || command.startsWith('COMMENT') || command.includes('VERIFICACIÓN')) {
        continue;
      }

      console.log(`${i + 1}. Ejecutando comando...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: command + ';'
        });

        if (error) {
          // Algunos errores son esperados (como DROP CONSTRAINT si no existe)
          if (error.message.includes('does not exist')) {
            console.log(`   ⚠️  Constraint no existe (esto es normal): ${error.message}`);
          } else {
            console.error(`   ❌ Error: ${error.message}`);
          }
        } else {
          console.log(`   ✅ Comando ejecutado correctamente`);
        }
      } catch (err) {
        console.error(`   ❌ Error inesperado:`, err);
      }
    }

    console.log('\n✅ Proceso completado');

    // Verificar el resultado
    console.log('\n🔍 Verificando cambios...');
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, is_nullable')
      .eq('table_name', 'area_submissions')
      .eq('column_name', 'alumno_id');

    if (colError) {
      console.error('❌ Error al verificar:', colError);
    } else if (columns && columns.length > 0) {
      const isNullable = columns[0].is_nullable;
      console.log(`\n📊 Estado de alumno_id: ${isNullable === 'YES' ? '✅ Acepta NULL' : '❌ NO acepta NULL'}`);
    }

  } catch (error) {
    console.error('\n❌ Error fatal:', error);
  }
}

fixAlumnoIdNullable().catch(console.error);
