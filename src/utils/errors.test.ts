import { describe, expect, it } from 'vitest';
import { errorCode, errorDetails, errorMessage } from './errors';

describe('errors', () => {
  it('lee el mensaje de Error, objetos de Supabase y strings', () => {
    expect(errorMessage(new Error('falló'))).toBe('falló');
    expect(errorMessage({ message: 'duplicate key', code: '23505' })).toBe('duplicate key');
    expect(errorMessage('texto')).toBe('texto');
  });

  it('usa el texto por defecto cuando no hay mensaje', () => {
    expect(errorMessage(null)).toBe('Error desconocido');
    expect(errorMessage({}, 'Otro')).toBe('Otro');
  });

  it('lee code y details', () => {
    expect(errorCode({ code: 'PGRST116' })).toBe('PGRST116');
    expect(errorCode(new Error('x'))).toBeUndefined();
    expect(errorDetails({ details: 'fila duplicada' })).toBe('fila duplicada');
    expect(errorDetails({ hint: 'revisa' })).toBe('revisa');
  });
});
