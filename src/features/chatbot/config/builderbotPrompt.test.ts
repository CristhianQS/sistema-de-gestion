import { describe, expect, it } from 'vitest';
import { chatbotConfig } from './chatbotPrompts';
import { AREAS_RESPONSABLES, buildBuilderBotSegments, joinSegments, toWhatsApp } from './builderbotPrompt';

describe('builderbotPrompt', () => {
  it('convierte negrita de Markdown al formato de WhatsApp', () => {
    expect(toWhatsApp('Elegiste **Soporte** y **TI**')).toBe('Elegiste *Soporte* y *TI*');
  });

  it('incluye las 10 áreas responsables con su descripción', () => {
    const areas = buildBuilderBotSegments(chatbotConfig).find((s) => s.key === 'areas')!.text;
    expect(AREAS_RESPONSABLES).toHaveLength(10);
    for (const a of AREAS_RESPONSABLES) expect(areas).toContain(`- ${a.nombre} — ${a.descripcion}`);
  });

  it('usa los mínimos de validación de la configuración', () => {
    const config = { ...chatbotConfig, validacion: { ...chatbotConfig.validacion, longitudMinimaDescripcion: 25 } };
    const flujo = buildBuilderBotSegments(config).find((s) => s.key === 'flujo')!.text;
    expect(flujo).toContain('menos de 25 caracteres');
  });

  it('pide el código antes del problema y termina con la frase de confirmación', () => {
    const full = joinSegments(buildBuilderBotSegments(chatbotConfig));
    expect(full.indexOf('2. Código')).toBeLessThan(full.indexOf('3. Problema'));
    expect(full).toContain('Estamos registrando tu reporte');
    expect(full).not.toContain('ISSUE_SAVED');
    expect(full).toContain('_Esta incidencia será atendida por el Área de [valor]_');
  });

  it('entiende "carpeta" como mobiliario y limita las preguntas', () => {
    const full = joinSegments(buildBuilderBotSegments(chatbotConfig));
    expect(full).toContain('*Carpeta* = pupitre');
    expect(full).toContain('como máximo 3 preguntas');
    expect(full).toContain('NUNCA preguntes: el curso');
    expect(full).toContain('_Tipo de incidencia: Mobiliario_');
  });

  it('no incluye frases de saludo que la IA pueda copiar', () => {
    const full = joinSegments(buildBuilderBotSegments(chatbotConfig));
    expect(full).not.toContain('Te identifiqué');
    expect(full).toContain('EXACTAMENTE esta y nada más');
  });

  it('junta todos los bloques en un solo prompt sin Markdown doble', () => {
    const segs = buildBuilderBotSegments(chatbotConfig);
    const full = joinSegments(segs);
    for (const s of segs) expect(full).toContain(`### ${s.title.toUpperCase()}`);
    expect(full).not.toContain('**');
  });
});
