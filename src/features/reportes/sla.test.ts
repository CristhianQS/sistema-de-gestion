import { describe, expect, it } from 'vitest';
import { duracionCorta, slaDe, SLA_POR_DEFECTO } from './sla';

const AHORA = new Date('2026-11-06T12:00:00Z').getTime();
const haceHoras = (h: number) => new Date(AHORA - h * 3600_000).toISOString();

describe('slaDe', () => {
  it('no aplica a reportes resueltos', () => {
    expect(slaDe({ status: 'resolved', submitted_at: haceHoras(100), area_nombre: 'Limpieza' }, AHORA)).toBeNull();
  });

  it('usa el SLA del área sin importar tildes ni mayúsculas', () => {
    const s = slaDe({ status: 'pending', submitted_at: haceHoras(2), area_nombre: 'centro medico' }, AHORA)!;
    expect(s.limiteHoras).toBe(1);
    expect(s.vencido).toBe(true);
  });

  it('los docentes tienen la mitad del tiempo', () => {
    const s = slaDe({ status: 'in_progress', submitted_at: haceHoras(3), area_nombre: 'Soporte Técnico', es_docente: true }, AHORA)!;
    expect(s.limiteHoras).toBe(2);
    expect(s.vencido).toBe(true);
  });

  it('marca "por vencer" cuando queda menos del 25 %', () => {
    const s = slaDe({ status: 'pending', submitted_at: haceHoras(3.5), area_nombre: 'Limpieza' }, AHORA)!;
    expect(s.vencido).toBe(false);
    expect(s.porVencer).toBe(true);
  });

  it('áreas desconocidas usan el SLA por defecto', () => {
    const s = slaDe({ status: 'pending', submitted_at: haceHoras(1), area_nombre: 'DTI' }, AHORA)!;
    expect(s.limiteHoras).toBe(SLA_POR_DEFECTO);
  });
});

describe('duracionCorta', () => {
  it('formatea minutos, horas y días', () => {
    expect(duracionCorta(30 * 60_000)).toBe('30 min');
    expect(duracionCorta(-5 * 3600_000)).toBe('5 h');
    expect(duracionCorta(72 * 3600_000)).toBe('3 d');
  });
});
