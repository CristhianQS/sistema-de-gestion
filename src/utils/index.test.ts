import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateShort,
  getStatusLabel,
  getStatusColor,
  isValidEmail,
  capitalize,
  truncate,
  isEmpty,
  sortBy,
  getRouteByRole,
} from './index';
import { ROUTES } from '../constants';

describe('Utils - Formateo de Fechas', () => {
  it('debería formatear una fecha correctamente', () => {
    const dateString = '2025-01-15T10:30:00';
    const formatted = formatDate(dateString);
    expect(formatted).toContain('15');
    expect(formatted).toContain('01');
    expect(formatted).toContain('2025');
  });

  it('debería formatear una fecha corta correctamente', () => {
    const dateString = '2025-01-15T10:30:00';
    const formatted = formatDateShort(dateString);
    expect(formatted).toMatch(/15\/01\/2025/);
  });
});

describe('Utils - Estado', () => {
  it('debería obtener la etiqueta correcta de un estado', () => {
    expect(getStatusLabel('pending')).toBe('Pendiente');
    expect(getStatusLabel('approved')).toBe('Aprobado');
    expect(getStatusLabel('rejected')).toBe('Rechazado');
  });

  it('debería obtener el color correcto de un estado', () => {
    expect(getStatusColor('pending')).toBe('#FFA500');
    expect(getStatusColor('approved')).toBe('#4CAF50');
    expect(getStatusColor('rejected')).toBe('#F44336');
  });
});

describe('Utils - Validación', () => {
  it('debería validar emails correctamente', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid.email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Utils - Cadenas', () => {
  it('debería capitalizar correctamente', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('hELLO')).toBe('Hello');
    expect(capitalize('')).toBe('');
  });

  it('debería truncar texto correctamente', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Hello', 10)).toBe('Hello');
    expect(truncate('Hello World', 11)).toBe('Hello World');
  });
});

describe('Utils - Objetos', () => {
  it('debería detectar objetos vacíos', () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ key: 'value' })).toBe(false);
  });
});

describe('Utils - Arrays', () => {
  it('debería ordenar arrays por una propiedad', () => {
    const data = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const sortedAsc = sortBy(data, 'name', 'asc');
    expect(sortedAsc[0].name).toBe('Alice');
    expect(sortedAsc[2].name).toBe('Charlie');

    const sortedDesc = sortBy(data, 'age', 'desc');
    expect(sortedDesc[0].age).toBe(35);
    expect(sortedDesc[2].age).toBe(25);
  });
});

describe('Utils - Navegación', () => {
  it('debería obtener la ruta correcta según el rol', () => {
    expect(getRouteByRole('admin_black')).toBe(ROUTES.ADMIN_BLACK);
    expect(getRouteByRole('admin_oro')).toBe(ROUTES.ADMIN_ORO);
    expect(getRouteByRole('admin_plata')).toBe(ROUTES.ADMIN_PLATA);
  });
});
