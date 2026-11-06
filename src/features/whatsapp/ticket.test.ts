import { describe, expect, it } from 'vitest';
import { esConfirmacion, parseCalificacion, parseResumen, ubicarEnCampus } from '../../../supabase/functions/_shared/ticket';

const RESUMEN = `Nombres: Quispe Condori Elizabeth Esmeralda
Problema: El proyector no enciende
Ubicación: Pabellón A - B 101
Imagen: No
Información adicional: vacío

_Esta incidencia será atendida por el Área de Soporte Técnico_
_Tipo de incidencia: Proyector_

¿Confirmas esta información?`;

describe('parseResumen', () => {
  it('lee todos los campos del resumen', () => {
    expect(parseResumen(RESUMEN)).toEqual({
      nombres: 'Quispe Condori Elizabeth Esmeralda',
      problema: 'El proyector no enciende',
      ubicacion: 'Pabellón A - B 101',
      imagen: '',
      informacion_adicional: '',
      area: 'Soporte Técnico',
      tipo_incidencia: 'Proyector',
    });
  });

  it('tolera negritas de WhatsApp', () => {
    const r = parseResumen(RESUMEN.replace('Problema:', '*Problema:*').replace('Nombres:', '*Nombres*:'));
    expect(r?.problema).toBe('El proyector no enciende');
    expect(r?.nombres).toBe('Quispe Condori Elizabeth Esmeralda');
  });

  it('devuelve null si no es un resumen', () => {
    expect(parseResumen('¡Hola! ¿En qué puedo ayudarte?')).toBeNull();
  });
});

describe('ubicarEnCampus', () => {
  const pabellones = [
    { id: 1, nombre: 'Pabellón A' },
    { id: 2, nombre: 'Pabello B' },
    { id: 3, nombre: 'pabellon c' },
    { id: 4, nombre: 'canchas' },
  ];
  const salones = [
    { id: 1, pabellon_id: 1, nombre: 'A 101' },
    { id: 2, pabellon_id: 2, nombre: '201' },
    { id: 3, pabellon_id: 3, nombre: 'C 101' },
    { id: 5, pabellon_id: 4, nombre: 'cancha 1' },
  ];

  it('reconoce pabellón y aula en distintas formas', () => {
    for (const txt of ['Pabellón B, aula 201', 'B-201', 'b201', 'pabellon b 201']) {
      const r = ubicarEnCampus(txt, pabellones, salones);
      expect(r.pabellon?.id, txt).toBe(2);
      expect(r.salon?.id, txt).toBe(2);
    }
  });

  it('reconoce lugares con nombre', () => {
    const r = ubicarEnCampus('en la cancha 1', pabellones, salones);
    expect(r.pabellon?.id).toBe(4);
    expect(r.salon?.id).toBe(5);
  });

  it('si el aula no existe, guarda solo el pabellón', () => {
    const r = ubicarEnCampus('Pabellón C, aula 305', pabellones, salones);
    expect(r.pabellon?.id).toBe(3);
    expect(r.salon).toBeNull();
  });

  it('no inventa ubicaciones', () => {
    expect(ubicarEnCampus('biblioteca segundo piso', pabellones, salones)).toEqual({ pabellon: null, salon: null });
    expect(ubicarEnCampus('frente a la biblioteca', pabellones, salones)).toEqual({ pabellon: null, salon: null });
  });
});

describe('parseCalificacion', () => {
  it('acepta 1 a 5', () => {
    expect(parseCalificacion('5')).toBe(5);
    expect(parseCalificacion(' 3 ')).toBe(3);
    expect(parseCalificacion('4 estrellas')).toBe(4);
  });

  it('rechaza otros textos', () => {
    expect(parseCalificacion('6')).toBeNull();
    expect(parseCalificacion('202512033')).toBeNull();
    expect(parseCalificacion('1. DTI')).toBeNull();
  });
});

describe('esConfirmacion', () => {
  it('reconoce la frase nueva y la señal antigua', () => {
    expect(esConfirmacion('✅ ¡Listo! Estamos registrando tu reporte.')).toBe(true);
    expect(esConfirmacion('ISSUE_SAVED')).toBe(true);
    expect(esConfirmacion('¿Confirmas esta información?')).toBe(false);
  });
});
