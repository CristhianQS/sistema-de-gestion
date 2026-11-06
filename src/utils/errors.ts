/**
 * Helpers para leer errores de `catch` sin usar `any`. Funcionan con Error,
 * errores de Supabase (PostgrestError, con code/details/hint) y strings.
 */
type ErrorLike = { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };

const asObject = (e: unknown): ErrorLike | null => (e && typeof e === 'object' ? (e as ErrorLike) : null);

export function errorMessage(e: unknown, fallback = 'Error desconocido'): string {
  if (typeof e === 'string') return e || fallback;
  const msg = asObject(e)?.message;
  return typeof msg === 'string' && msg ? msg : fallback;
}

export function errorCode(e: unknown): string | undefined {
  const code = asObject(e)?.code;
  return typeof code === 'string' ? code : undefined;
}

export function errorDetails(e: unknown): string | undefined {
  const o = asObject(e);
  const v = o?.details ?? o?.hint;
  return typeof v === 'string' ? v : undefined;
}
