import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Search,
  Download,
  BarChart3,
  Table as TableIcon,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  MoveHorizontal,
  Clock,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Layers
} from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';
import {
  resolverReporteConIA,
  ReportQueryResult,
  ReportColumn,
  exportarACSVExcel
} from '../engine/reportEngine';

interface ReportesGenerativosIAProps {
  alojamientos: Alojamiento[];
  onMostrarToast: (msg: string) => void;
}

const SUGERENCIAS_RAPIDAS = [
  'Ocupación y tarifas de todas mis habitaciones',
  'Ingresos netos y liquidaciones acreditadas en BNB',
  'Reservas activas con código PIN de check-in',
  'Calificaciones de huéspedes agrupadas por tópico',
  'Solo 3 columnas: Nombre, Tarifa BOB y Estado'
];

export const ReportesGenerativosIA: React.FC<ReportesGenerativosIAProps> = ({
  alojamientos,
  onMostrarToast
}) => {
  const [prompt, setPrompt] = useState('');
  const [cargando, setCargando] = useState(false);
  const [escuchandoVoz, setEscuchandoVoz] = useState(false);
  const [tabActiva, setTabActiva] = useState<'tabla' | 'grafico'>('tabla');
  const [resultado, setResultado] = useState<ReportQueryResult | null>(null);

  // Columnas activas y reordenables (Drag & Reorder / Toggle)
  const [columnasVisibles, setColumnasVisibles] = useState<ReportColumn[]>([]);
  const [mostrarSelectorColumnas, setMostrarSelectorColumnas] = useState(false);
  const [columnaArrastrada, setColumnaArrastrada] = useState<number | null>(null);

  // Fila expandida para desglose (Drill-Down)
  const [filaDesglosada, setFilaDesglosada] = useState<Record<string, any> | null>(null);

  const handleEjecutarConsulta = async (textoConsulta: string) => {
    if (!textoConsulta.trim()) return;
    setCargando(true);
    setFilaDesglosada(null);

    try {
      const res = await resolverReporteConIA(textoConsulta, alojamientos, 'ANFITRION');
      setResultado(res);
      setColumnasVisibles(res.columnas);
      onMostrarToast(`Reporte generado con ${res.proveedorIA} en ${res.tiempoMs} ms.`);
    } catch {
      onMostrarToast('Error al procesar la consulta de datos.');
    } finally {
      setCargando(false);
    }
  };

  // Entrada por Voz con Web Speech API
  const handleToggleVoz = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onMostrarToast('El navegador no admite reconocimiento de voz nativo.');
      return;
    }

    if (escuchandoVoz) {
      setEscuchandoVoz(false);
      return;
    }

    try {
      const reconocimiento = new SpeechRecognition();
      reconocimiento.lang = 'es-BO';
      reconocimiento.continuous = false;
      reconocimiento.interimResults = false;

      reconocimiento.onstart = () => {
        setEscuchandoVoz(true);
        onMostrarToast('Escuchando... Puedes hablar ahora.');
      };

      reconocimiento.onresult = (event: any) => {
        const transcrito = event.results[0][0].transcript;
        setPrompt(transcrito);
        setEscuchandoVoz(false);
        handleEjecutarConsulta(transcrito);
      };

      reconocimiento.onerror = () => {
        setEscuchandoVoz(false);
        onMostrarToast('No se detectó voz o se canceló el micrófono.');
      };

      reconocimiento.onend = () => {
        setEscuchandoVoz(false);
      };

      reconocimiento.start();
    } catch {
      setEscuchandoVoz(false);
    }
  };

  // Reordenar columnas mediante arrastre (Drag & Drop)
  const handleDragStart = (indice: number) => {
    setColumnaArrastrada(indice);
  };

  const handleDragOver = (e: React.DragEvent, indiceDestino: number) => {
    e.preventDefault();
    if (columnaArrastrada === null || columnaArrastrada === indiceDestino) return;

    const nuevas = [...columnasVisibles];
    const [arrastrada] = nuevas.splice(columnaArrastrada, 1);
    nuevas.splice(indiceDestino, 0, arrastrada);
    setColumnaArrastrada(indiceDestino);
    setColumnasVisibles(nuevas);
  };

  const handleDragEnd = () => {
    setColumnaArrastrada(null);
  };

  // Ocultar / Mostrar columna individual
  const toggleColumna = (key: string) => {
    if (!resultado) return;
    const existe = columnasVisibles.some(c => c.key === key);
    if (existe) {
      if (columnasVisibles.length <= 1) {
        onMostrarToast('Debe permanecer al menos una columna visible.');
        return;
      }
      setColumnasVisibles(columnasVisibles.filter(c => c.key !== key));
    } else {
      const original = resultado.columnas.find(c => c.key === key);
      if (original) {
        setColumnasVisibles([...columnasVisibles, original]);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Barra de Consulta Multimodal con IA */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>Generador de Reportes con Inteligencia Artificial</span>
          </div>

          {resultado && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{resultado.tiempoMs} ms • {resultado.proveedorIA}</span>
            </div>
          )}
        </div>

        {/* Input y botones de acción */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEjecutarConsulta(prompt);
          }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Pregunta en lenguaje natural: 'Ocupación por habitación', 'Ingresos netos', 'Solo 3 columnas'..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* Botón de Voz */}
          <button
            type="button"
            onClick={handleToggleVoz}
            className={`p-3.5 rounded-2xl border transition cursor-pointer shrink-0 ${
              escuchandoVoz
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-4 ring-rose-500/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Hablar por micrófono (Español)"
          >
            {escuchandoVoz ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Botón de Ejecutar */}
          <button
            type="submit"
            disabled={cargando}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-2"
          >
            {cargando ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generar Reporte</span>
          </button>
        </form>

        {/* Píldoras de sugerencias rápidas */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Sugerencias:
          </span>
          {SUGERENCIAS_RAPIDAS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(sug);
                handleEjecutarConsulta(sug);
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-semibold transition border border-slate-200/60 dark:border-slate-700/60"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Estado Inicial sin consulta activa */}
      {!resultado && !cargando && (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
            Generador de Reportes con Inteligencia Artificial
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Ingresa tu consulta en lenguaje natural arriba o pulsa cualquiera de las sugerencias rápidas para generar tu reporte ejecutivo al instante.
          </p>
        </div>
      )}

      {/* Tarjetas de KPIs Ejecutivos Automáticos */}
      {resultado && resultado.kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resultado.kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {kpi.label}
              </span>
              <div className={`font-serif text-2xl font-bold mt-1 ${kpi.color || 'text-slate-900 dark:text-white'}`}>
                {kpi.valor}
              </div>
              {kpi.subtexto && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {kpi.subtexto}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contenedor Principal: Barra de Herramientas de Tabla, Pestañas y Exportación */}
      {resultado && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          
          {/* Header de Herramientas */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            
            {/* Selector de Pestañas: Tabla, Gráficos Ejecutivos */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTabActiva('tabla')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  tabActiva === 'tabla'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla de Datos</span>
                <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px]">
                  {resultado.totalFilas}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('grafico')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition ${
                  tabActiva === 'grafico'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Gráficos Ejecutivos</span>
              </button>
            </div>

            {/* Acciones de Tabla: Reordenar / Selector de Columnas y Descarga Excel */}
            <div className="flex items-center gap-2">
              
              {/* Botón Selector de Columnas */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMostrarSelectorColumnas(!mostrarSelectorColumnas)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                  <span>Columnas ({columnasVisibles.length})</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {mostrarSelectorColumnas && (
                  <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        Personalizar Columnas
                      </span>
                      <button
                        type="button"
                        onClick={() => setColumnasVisibles(resultado.columnas)}
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        Restaurar todas
                      </button>
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {resultado.columnas.map(col => {
                        const activa = columnasVisibles.some(c => c.key === col.key);
                        return (
                          <button
                            key={col.key}
                            type="button"
                            onClick={() => toggleColumna(col.key)}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-left"
                          >
                            <span className="text-slate-700 dark:text-slate-200 truncate">
                              {col.label}
                            </span>
                            {activa ? (
                              <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Exportar a Excel */}
              <button
                type="button"
                onClick={() => {
                  exportarACSVExcel(resultado.filas, 'reporte_anfitrion_alojate.csv');
                  onMostrarToast('Archivo CSV para Excel descargado con éxito.');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar a Excel</span>
              </button>
            </div>
          </div>

          {/* CUERPO SEGÚN PESTAÑA */}

          {/* 1. Vista Tabla Interactiva con Arrastre de Columnas y Desglose de Filas */}
          {tabActiva === 'tabla' && (
            <div className="overflow-x-auto">
              <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-950/20 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/50">
                <MoveHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Tip profesional: Puedes <strong>arrastrar los encabezados</strong> para reordenar las columnas y hacer <strong>clic en cualquier fila</strong> para ver su desglose pormenorizado.
                </span>
              </div>

              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white uppercase font-bold text-[10px] tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3.5 w-10 text-center">#</th>
                    {columnasVisibles.map((col, idx) => (
                      <th
                        key={col.key}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`px-4 py-3.5 cursor-grab active:cursor-grabbing hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition border-r border-slate-200/40 dark:border-slate-800/60 last:border-r-0 ${
                          columnaArrastrada === idx ? 'bg-blue-200/70 dark:bg-blue-800/70' : ''
                        }`}
                        title="Arrastra para reordenar esta columna"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{col.label}</span>
                          <MoveHorizontal className="w-3 h-3 text-slate-400 opacity-60" />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3.5 text-right">Desglose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {resultado.filas.map((fila, fIdx) => (
                    <tr
                      key={fIdx}
                      onClick={() => setFilaDesglosada(fila)}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 text-center text-slate-400 font-mono text-[10px]">
                        {fIdx + 1}
                      </td>
                      {columnasVisibles.map(col => {
                        const val = fila[col.key];
                        return (
                          <td key={col.key} className="px-4 py-3 font-medium">
                            {col.type === 'currency' ? (
                              <span className="font-bold text-slate-900 dark:text-white">
                                Bs. {Number(val || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                              </span>
                            ) : col.type === 'badge' ? (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                String(val).includes('LIBRE') || String(val).includes('PUBLICADO')
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : String(val).includes('PENDIENTE')
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}>
                                {val || 'Activo'}
                              </span>
                            ) : (
                              <span>{String(val ?? '—')}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700">
                          <span>Ver</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Vista Gráficos Ejecutivos SVG */}
          {tabActiva === 'grafico' && (
            <div className="p-6 sm:p-8 space-y-6">
              {resultado.grafico ? (
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {resultado.grafico.titulo}
                  </h4>
                  <p className="text-xs text-slate-400 mb-6">
                    Visualización vectorial de proporciones basada en el resultado de la consulta.
                  </p>

                  {/* Renderizado de Barras Proporcionales SVG */}
                  <div className="space-y-4">
                    {resultado.grafico.etiquetas.map((etiq, i) => {
                      const valor = resultado.grafico!.valores[i];
                      const maxVal = Math.max(...resultado.grafico!.valores, 1);
                      const porcentaje = Math.round((valor / maxVal) * 100);

                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-800 dark:text-slate-200 truncate">
                              {etiq}
                            </span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {resultado.grafico!.formato === 'moneda'
                                ? `Bs. ${valor.toLocaleString('es-BO')}`
                                : valor}
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700"
                              style={{ width: `${Math.max(porcentaje, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No se detectaron métricas numéricas suficientes en esta consulta para proyectar un gráfico.
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Modal / Panel Desglose Detallado de Fila (Drill-Down) */}
      {filaDesglosada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-modal-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Desglose Operativo Pormenorizado
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Detalle del Registro Seleccionado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFilaDesglosada(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {Object.entries(filaDesglosada).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                >
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    {k.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right ml-4">
                    {typeof v === 'number' && (k.toLowerCase().includes('monto') || k.toLowerCase().includes('precio') || k.toLowerCase().includes('neto'))
                      ? `Bs. ${v.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
                      : String(v ?? '—')}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFilaDesglosada(null)}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer"
            >
              Cerrar Desglose
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
