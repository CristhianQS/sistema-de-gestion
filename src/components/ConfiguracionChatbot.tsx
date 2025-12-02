import React, { useState } from 'react';
import { chatbotConfig, actualizarConfig } from '../config/chatbotPrompts';

/**
 * Componente para configurar los prompts del chatbot desde la interfaz
 *
 * Este componente permite a los administradores modificar:
 * - Mensajes de bienvenida
 * - Mensajes de error
 * - Mensajes de confirmación
 * - Parámetros de validación
 */
const ConfiguracionChatbot: React.FC = () => {
  const [config, setConfig] = useState(chatbotConfig);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleGuardar = () => {
    setGuardando(true);
    actualizarConfig(config);

    setTimeout(() => {
      setGuardando(false);
      setMensaje('✅ Configuración guardada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    }, 500);
  };

  const handleRestaurar = () => {
    if (confirm('¿Estás seguro de restaurar la configuración por defecto?')) {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          ⚙️ Configuración del Chatbot
        </h2>
        <p className="text-gray-600">
          Personaliza los mensajes y el comportamiento del asistente virtual
        </p>
      </div>

      {mensaje && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {mensaje}
        </div>
      )}

      <div className="space-y-6">
        {/* MENSAJES DE BIENVENIDA */}
        <section className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👋</span>
            Mensajes de Bienvenida
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje Inicial
              </label>
              <textarea
                value={config.mensajes.bienvenida}
                onChange={(e) => setConfig({
                  ...config,
                  mensajes: { ...config.mensajes, bienvenida: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje de bienvenida al abrir el chat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Inválido
              </label>
              <textarea
                value={config.mensajes.codigoInvalido}
                onChange={(e) => setConfig({
                  ...config,
                  mensajes: { ...config.mensajes, codigoInvalido: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje cuando el código no es válido"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código No Encontrado
              </label>
              <textarea
                value={config.mensajes.codigoNoEncontrado}
                onChange={(e) => setConfig({
                  ...config,
                  mensajes: { ...config.mensajes, codigoNoEncontrado: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje cuando no se encuentra el código en la BD"
              />
            </div>
          </div>
        </section>

        {/* SOLICITUDES DE INFORMACIÓN */}
        <section className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Solicitudes de Información
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Muy Corta
              </label>
              <textarea
                value={config.solicitudes.descripcionMuyCorta}
                onChange={(e) => setConfig({
                  ...config,
                  solicitudes: { ...config.solicitudes, descripcionMuyCorta: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje cuando la descripción es muy corta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solicitud de Ubicación
              </label>
              <textarea
                value={config.solicitudes.ubicacion}
                onChange={(e) => setConfig({
                  ...config,
                  solicitudes: { ...config.solicitudes, ubicacion: e.target.value }
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje solicitando la ubicación del problema"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación Inválida
              </label>
              <textarea
                value={config.solicitudes.ubicacionInvalida}
                onChange={(e) => setConfig({
                  ...config,
                  solicitudes: { ...config.solicitudes, ubicacionInvalida: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje cuando la ubicación es inválida"
              />
            </div>
          </div>
        </section>

        {/* CONFIGURACIÓN DE VALIDACIÓN */}
        <section className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Parámetros de Validación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud Mínima de Descripción
              </label>
              <input
                type="number"
                value={config.validacion.longitudMinimaDescripcion}
                onChange={(e) => setConfig({
                  ...config,
                  validacion: { ...config.validacion, longitudMinimaDescripcion: parseInt(e.target.value) }
                })}
                min="5"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Caracteres mínimos requeridos</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud Mínima de Ubicación
              </label>
              <input
                type="number"
                value={config.validacion.longitudMinimaUbicacion}
                onChange={(e) => setConfig({
                  ...config,
                  validacion: { ...config.validacion, longitudMinimaUbicacion: parseInt(e.target.value) }
                })}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Caracteres mínimos requeridos</p>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.validacion.permitirSoloNumerosCodigo}
                  onChange={(e) => setConfig({
                    ...config,
                    validacion: { ...config.validacion, permitirSoloNumerosCodigo: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Permitir solo números en código de estudiante
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* MENSAJE DE CONFIRMACIÓN */}
        <section className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Mensaje de Creación de Reporte
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creando Reporte
              </label>
              <textarea
                value={config.confirmaciones.creandoReporte}
                onChange={(e) => setConfig({
                  ...config,
                  confirmaciones: { ...config.confirmaciones, creandoReporte: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mensaje mientras se crea el reporte"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Nota:</strong> Los mensajes de "Reporte Creado" y "Error al Crear" son funciones dinámicas.
              </p>
              <p className="text-xs text-blue-600">
                Para modificarlos, edita directamente el archivo:
                <code className="bg-blue-100 px-2 py-1 rounded ml-1">
                  src/config/chatbotPrompts.ts
                </code>
              </p>
            </div>
          </div>
        </section>

        {/* PROMPTS DEL SISTEMA (IA) */}
        <section className="border border-purple-300 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            Configuración de IA (GPT-4o-mini)
          </h3>

          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-900 font-medium">
              ✨ Estos prompts controlan cómo se comporta GPT-4o-mini en el chatbot
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Los cambios se aplicarán en las funciones de clasificación, mejora de descripciones y extracción de información.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol del Asistente
              </label>
              <textarea
                value={config.sistemPrompts.rol}
                onChange={(e) => setConfig({
                  ...config,
                  sistemPrompts: { ...config.sistemPrompts, rol: e.target.value }
                })}
                rows={4}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                placeholder="Define quién es el chatbot y cuál es su rol principal"
              />
              <p className="text-xs text-gray-500 mt-1">Este prompt define la identidad del asistente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo Principal
              </label>
              <textarea
                value={config.sistemPrompts.objetivo}
                onChange={(e) => setConfig({
                  ...config,
                  sistemPrompts: { ...config.sistemPrompts, objetivo: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                placeholder="Describe el objetivo principal del chatbot"
              />
              <p className="text-xs text-gray-500 mt-1">Qué debe lograr el asistente en cada interacción</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tono de Comunicación
              </label>
              <textarea
                value={config.sistemPrompts.tono}
                onChange={(e) => setConfig({
                  ...config,
                  sistemPrompts: { ...config.sistemPrompts, tono: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                placeholder="Cómo debe comunicarse (formal, amigable, profesional, etc.)"
              />
              <p className="text-xs text-gray-500 mt-1">El estilo de comunicación que debe usar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restricciones (una por línea)
              </label>
              <textarea
                value={config.sistemPrompts.restricciones.join('\n')}
                onChange={(e) => setConfig({
                  ...config,
                  sistemPrompts: {
                    ...config.sistemPrompts,
                    restricciones: e.target.value.split('\n').filter(r => r.trim() !== '')
                  }
                })}
                rows={6}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-mono text-sm"
                placeholder="- Restricción 1&#10;- Restricción 2&#10;- Restricción 3"
              />
              <p className="text-xs text-gray-500 mt-1">Límites y reglas que debe seguir (escribe cada restricción en una línea nueva)</p>
            </div>
          </div>
        </section>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="mt-8 flex gap-4 justify-end border-t pt-6">
        <button
          onClick={handleRestaurar}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Restaurar Valores por Defecto
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* ADVERTENCIA */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Importante:</strong> Los cambios se aplicarán inmediatamente pero solo permanecerán durante la sesión actual.
          Para cambios permanentes, modifica el archivo <code className="bg-yellow-100 px-2 py-1 rounded">src/config/chatbotPrompts.ts</code>
        </p>
      </div>
    </div>
  );
};

export default ConfiguracionChatbot;
