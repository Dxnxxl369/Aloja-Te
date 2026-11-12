import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReportAdminService,
  ReportQueryResultAdmin,
  ReportColumnAdmin
} from '../../report-admin.service';
import { SolicitudAlojamiento, LiquidacionAnfitrion, ReporteGenerativo } from '../../core/types/admin.types';
import { VALORACIONES_ADMIN_DEMO } from '../../core/data/valoraciones-demo.data';

@Component({
  selector: 'app-reportes-ia-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Query Bar -->
      <div class="p-6 rounded-3xl liquid-card space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-serif font-bold text-base text-slate-900 dark:text-white">
                Copilot de Analítica & SQL con IA
              </h3>
              <p class="text-xs text-slate-500 dark:text-stone-400">Consultas generativas en lenguaje natural sobre finanzas, ocupación y auditoría</p>
            </div>
          </div>
          <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full">
            Modelo IA Nacional
          </span>
        </div>

        <!-- Input Row -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input type="text"
                   [(ngModel)]="query"
                   (keyup.enter)="ejecutarQuery()"
                   placeholder="Escribe tu consulta en lenguaje natural (ej: comisiones por departamento, ocupación, auditoría...)"
                   class="w-full px-4 py-3 pl-10 rounded-2xl bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            <svg class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Mic Button -->
          <button type="button"
                  (click)="toggleVoz()"
                  [ngClass]="escuchandoVoz ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300'"
                  class="w-11 h-11 rounded-2xl border border-slate-200 dark:border-stone-700 flex items-center justify-center transition cursor-pointer shadow-sm text-sm"
                  title="Dictado por voz">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <!-- Execute Button -->
          <button type="button"
                  (click)="ejecutarQuery()"
                  [disabled]="cargando"
                  class="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-500/25 flex items-center gap-2">
            <svg *ngIf="cargando" class="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Consultar</span>
          </button>
        </div>

        <!-- Quick Prompts -->
        <div class="flex flex-wrap gap-2 text-[11px]">
          <span class="text-slate-400 self-center text-[10px] uppercase font-bold tracking-wider">Sugerencias:</span>
          <button type="button"
                  *ngFor="let p of sugerencias"
                  (click)="query = p; ejecutarQuery()"
                  class="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800/80 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-stone-700 transition cursor-pointer">
            {{ p }}
          </button>
        </div>
      </div>

      <!-- Result Container -->
      <div *ngIf="resultado" class="p-6 rounded-3xl liquid-card space-y-5">
        <!-- Sub-Tabs & Actions Header -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-stone-800 pb-4">
          <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800">
            <button type="button"
                    (click)="tabReporte = 'tabla'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    [ngClass]="tabReporte === 'tabla' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'">
              Tabla de Datos
            </button>
            <button type="button"
                    (click)="tabReporte = 'grafico'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    [ngClass]="tabReporte === 'grafico' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'">
              Gráfico Visual
            </button>
            <button type="button"
                    (click)="tabReporte = 'sql'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    [ngClass]="tabReporte === 'sql' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'">
              Consulta SQL
            </button>
            <button type="button"
                    (click)="tabReporte = 'informes'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    [ngClass]="tabReporte === 'informes' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'">
              Informes Ejecutivos
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button type="button"
                    *ngIf="tabReporte === 'tabla'"
                    (click)="exportarCSV()"
                    class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-bold text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-stone-700 transition cursor-pointer flex items-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <!-- KPIs Bar -->
        <div *ngIf="resultado.kpis && resultado.kpis.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div *ngFor="let k of resultado.kpis" class="p-3.5 rounded-2xl liquid-card border border-slate-200 dark:border-stone-800">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{{ k.label }}</span>
            <span class="text-lg font-black font-sans text-slate-900 dark:text-white">{{ k.valor }}</span>
            <span *ngIf="k.subtexto" class="text-[10px] block text-emerald-600 dark:text-emerald-400 font-semibold">{{ k.subtexto }}</span>
          </div>
        </div>

        <!-- 1. TAB: TABLA -->
        <div *ngIf="tabReporte === 'tabla'" class="space-y-4">
          <div *ngIf="resultado.filas.length === 0" class="py-12 text-center text-slate-400 text-xs liquid-card rounded-2xl border border-slate-200 dark:border-stone-800">
            No se encontraron registros en el sistema para esta consulta.
          </div>
          <div *ngIf="resultado.filas.length > 0" class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-stone-800">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 dark:bg-carbon-950/80 text-slate-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-stone-800">
                <tr>
                  <th *ngFor="let col of columnasVisibles" class="py-3.5 px-4 font-bold">
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-stone-800/60 text-slate-700 dark:text-stone-300">
                <tr *ngFor="let row of resultado.filas" class="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition">
                  <td *ngFor="let col of columnasVisibles" class="py-3.5 px-4 font-medium">
                    {{ row[col.key] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. TAB: GRAFICO -->
        <div *ngIf="tabReporte === 'grafico'" class="space-y-4">
          <div *ngIf="resultado.grafico" class="p-6 rounded-2xl liquid-card border border-slate-200 dark:border-stone-800 space-y-4">
            <h4 class="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">{{ resultado.grafico.titulo }}</h4>
            <div class="space-y-3 pt-2">
              <div *ngFor="let item of resultado.grafico.etiquetas; let idx = index" class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-700 dark:text-stone-300 font-semibold">{{ item }}</span>
                  <span class="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {{ resultado.grafico.valores[idx] | number:'1.2-2' }} {{ resultado.grafico.formato === 'moneda' ? 'BOB' : '' }}
                  </span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500" [style.width]="calcularPorcentajeBarra(resultado.grafico.valores[idx]) + '%'"></div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="!resultado.grafico" class="py-12 text-center text-xs text-slate-400">
            No se generó gráfico para esta consulta.
          </div>
        </div>

        <!-- 3. TAB: SQL -->
        <div *ngIf="tabReporte === 'sql'" class="space-y-3">
          <div class="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
            <div class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              // Consulta SQL generada por modelo IA ({{ resultado.proveedorIA }})
            </div>
            <pre class="text-emerald-400">{{ resultado.sqlEjecutado }}</pre>
          </div>
          <div class="text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>Tiempo de respuesta: {{ resultado.tiempoMs }}ms</span>
            <span>Total de registros: {{ resultado.totalFilas }}</span>
          </div>
        </div>

        <!-- 4. TAB: INFORMES EJECUTIVOS -->
        <div *ngIf="tabReporte === 'informes'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button type="button"
                    (click)="seleccionarInforme(1)"
                    class="p-4 rounded-2xl liquid-card border text-left transition cursor-pointer"
                    [ngClass]="tipoInforme === 1 ? 'border-blue-500 bg-blue-500/10' : 'border-slate-200 dark:border-stone-800'">
              <strong class="block text-xs font-bold text-slate-900 dark:text-white">Cierre Fiscal & Rentabilidad</strong>
              <span class="text-[10px] text-slate-400">Resumen mensual de comisiones</span>
            </button>
            <button type="button"
                    (click)="seleccionarInforme(2)"
                    class="p-4 rounded-2xl liquid-card border text-left transition cursor-pointer"
                    [ngClass]="tipoInforme === 2 ? 'border-blue-500 bg-blue-500/10' : 'border-slate-200 dark:border-stone-800'">
              <strong class="block text-xs font-bold text-slate-900 dark:text-white">Demanda Feriados & Festividades</strong>
              <span class="text-[10px] text-slate-400">Proyección temporal Q1</span>
            </button>
            <button type="button"
                    (click)="seleccionarInforme(3)"
                    class="p-4 rounded-2xl liquid-card border text-left transition cursor-pointer"
                    [ngClass]="tipoInforme === 3 ? 'border-blue-500 bg-blue-500/10' : 'border-slate-200 dark:border-stone-800'">
              <strong class="block text-xs font-bold text-slate-900 dark:text-white">Auditoría Preventiva de Calidad</strong>
              <span class="text-[10px] text-slate-400">Moderación y riesgos</span>
            </button>
          </div>

          <div *ngIf="informeGenerativo" class="p-6 rounded-2xl liquid-card border border-slate-200 dark:border-stone-800 space-y-4">
            <div>
              <h4 class="font-serif font-bold text-base text-slate-900 dark:text-white">{{ informeGenerativo.titulo }}</h4>
              <p class="text-xs text-slate-500">{{ informeGenerativo.periodo }} • Emisión: {{ informeGenerativo.fechaEmision }}</p>
            </div>
            <p class="text-xs leading-relaxed text-slate-700 dark:text-stone-300">
              {{ informeGenerativo.resumenEjecutivo }}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div *ngFor="let k of informeGenerativo.kpis" class="p-3 rounded-xl bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800">
                <span class="text-[10px] text-slate-400 font-bold uppercase">{{ k.etiqueta }}</span>
                <div class="text-base font-black text-slate-900 dark:text-white">{{ k.valor }}</div>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{{ k.variacion }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-stone-300">Puntos Clave</span>
              <ul class="list-disc pl-5 text-xs text-slate-600 dark:text-stone-400 space-y-1">
                <li *ngFor="let p of informeGenerativo.puntosClave">{{ p }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportesIaComponent implements OnInit {
  @Input() alojamientos: SolicitudAlojamiento[] = [];
  @Input() liquidaciones: LiquidacionAnfitrion[] = [];
  @Input() reservas: any[] = [];
  @Input() valoraciones: any[] = [];

  private reportService = new ReportAdminService();
  query: string = 'Comisiones y facturación consolidada por departamento';
  cargando: boolean = false;
  escuchandoVoz: boolean = false;
  tabReporte: 'tabla' | 'grafico' | 'sql' | 'informes' = 'tabla';
  resultado: ReportQueryResultAdmin | null = null;
  columnasVisibles: ReportColumnAdmin[] = [];
  tipoInforme: number = 1;
  informeGenerativo: ReporteGenerativo | null = null;

  sugerencias: string[] = [
    'Comisiones y facturación consolidada por departamento',
    'Ocupación y demanda turística',
    'Auditoría de alojamientos observados',
    'Liquidaciones bancarias pendientes'
  ];

  ngOnInit() {
    this.ejecutarQuery();
    this.seleccionarInforme(1);
  }

  async ejecutarQuery(consultaTexto?: string) {
    const q = consultaTexto || this.query;
    if (!q || !q.trim()) return;
    this.query = q;
    this.cargando = true;

    try {
      const res = await this.reportService.resolverReporteAdmin(q, {
        alojamientos: this.alojamientos,
        liquidaciones: this.liquidaciones,
        reservas: this.reservas,
        valoraciones: this.valoraciones
      });
      this.resultado = res;
      this.columnasVisibles = [...res.columnas];
    } catch (e) {
      console.warn('Error en reporte:', e);
    } finally {
      this.cargando = false;
    }
  }

  toggleVoz() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconocimiento de voz no admitido en este navegador.');
      return;
    }
    if (this.escuchandoVoz) {
      this.escuchandoVoz = false;
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'es-BO';
      rec.continuous = false;
      rec.onstart = () => { this.escuchandoVoz = true; };
      rec.onresult = (e: any) => {
        this.query = e.results[0][0].transcript;
        this.escuchandoVoz = false;
        this.ejecutarQuery();
      };
      rec.onerror = () => { this.escuchandoVoz = false; };
      rec.onend = () => { this.escuchandoVoz = false; };
      rec.start();
    } catch {
      this.escuchandoVoz = false;
    }
  }

  exportarCSV() {
    if (this.resultado && this.resultado.filas.length > 0) {
      this.reportService.exportarCSV(this.resultado.filas, 'reporte_admin_alojate.csv');
    }
  }

  calcularPorcentajeBarra(valor: number): number {
    if (!this.resultado?.grafico?.valores || this.resultado.grafico.valores.length === 0) return 0;
    const max = Math.max(...this.resultado.grafico.valores);
    if (max <= 0) return 0;
    return Math.min(100, Math.round((valor / max) * 100));
  }

  seleccionarInforme(tipo: number) {
    this.tipoInforme = tipo;
    const totalLiquidado = this.liquidaciones.reduce((acc, l) => acc + (l.montoNeto || 0), 0);
    const totalComisiones = this.liquidaciones.reduce((acc, l) => acc + (l.comisionPlataforma || 0), 0);
    const totalPropiedades = this.alojamientos.length;
    const totalReservas = this.reservas.length;

    if (tipo === 1) {
      this.informeGenerativo = {
        titulo: 'Informe de Cierre Fiscal & Rentabilidad Operativa',
        categoria: 'Finanzas',
        periodo: 'Consolidado Tiempo Real',
        fechaEmision: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
        resumenEjecutivo: totalPropiedades > 0 || totalReservas > 0
          ? `Operaciones consolidadas con ${totalPropiedades} alojamientos habilitados y ${totalReservas} reservas registradas. Liquidaciones procesadas por Bs. ${totalLiquidado.toFixed(2)}.`
          : 'Sistema recién inicializado con base de datos limpia. No existen reservas ni transacciones registradas hasta el momento.',
        kpis: [
          { etiqueta: 'Volumen Liquidado', valor: `${totalLiquidado.toFixed(2)} BOB`, variacion: totalLiquidado > 0 ? 'Activo' : '0.00 BOB', esPositivo: true },
          { etiqueta: 'Comisión Aloja-Te (10%)', valor: `${totalComisiones.toFixed(2)} BOB`, variacion: '10% retenido', esPositivo: true },
          { etiqueta: 'Alojamientos Registrados', valor: `${totalPropiedades}`, variacion: `${totalPropiedades} activos`, esPositivo: true }
        ],
        puntosClave: totalPropiedades > 0
          ? [
              `${totalPropiedades} propiedades en catálogo nacional.`,
              `${totalReservas} reservas gestionadas en total.`,
              `Liquidaciones netas procesadas: Bs. ${totalLiquidado.toFixed(2)}.`
            ]
          : [
              'Base de datos limpia y lista para nuevas publicaciones.',
              'No existen desvíos contables pendientes.',
              'Canales de pago y cobro QR configurados.'
            ],
        recomendacionesEstrategicas: [
          'Habilitar nuevos alojamientos en las regiones turísticas.',
          'Monitorear pagos y comisiones en tiempo real.'
        ]
      };
    } else if (tipo === 2) {
      this.informeGenerativo = {
        titulo: 'Proyección de Demanda para Temporadas Festivas',
        categoria: 'Mercado',
        periodo: 'Proyección Próxima Temporada',
        fechaEmision: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
        resumenEjecutivo: totalPropiedades > 0
          ? `Capacidad operativa actual de ${totalPropiedades} propiedades distribuidas a nivel nacional.`
          : 'Sistema preparado para el registro de nuevos alojamientos turísticos previo a temporadas festivas.',
        kpis: [
          { etiqueta: 'Propiedades Disponibles', valor: `${totalPropiedades}`, variacion: 'En línea', esPositivo: true },
          { etiqueta: 'Reservas Registradas', valor: `${totalReservas}`, variacion: 'Histórico', esPositivo: true },
          { etiqueta: 'Liquidaciones Pendientes', valor: `${this.liquidaciones.filter(l => l.estado === 'PENDIENTE').length}`, variacion: 'Por procesar', esPositivo: true }
        ],
        puntosClave: [
          'Monitoreo continuo de disponibilidad por departamento.',
          'Políticas de cobro transparentes sin cargos ficticios.'
        ],
        recomendacionesEstrategicas: [
          'Incentivar a los anfitriones a publicar sus calendarios de disponibilidad.'
        ]
      };
    } else {
      const observados = this.alojamientos.filter(a => a.estado === 'OBSERVADO').length;
      const pendientes = this.alojamientos.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_REVISION').length;
      const publicados = this.alojamientos.filter(a => a.estado === 'PUBLICADO').length;

      this.informeGenerativo = {
        titulo: 'Auditoría Preventiva de Calidad & Moderación IA',
        categoria: 'Seguridad',
        periodo: 'Auditoría Continua',
        fechaEmision: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
        resumenEjecutivo: `Auditoría automatizada de calidad: ${publicados} alojamientos verificados y publicados, ${pendientes} en revisión y ${observados} observados con solicitud de subsanación.`,
        kpis: [
          { etiqueta: 'Publicados Seguros', valor: `${publicados}`, variacion: '100% habitables', esPositivo: true },
          { etiqueta: 'Pendientes Revisión', valor: `${pendientes}`, variacion: 'En cola', esPositivo: true },
          { etiqueta: 'Observados por IA', valor: `${observados}`, variacion: 'Requieren corrección', esPositivo: observados === 0 }
        ],
        puntosClave: [
          'Inspección multimodal de fotografías con detección de imágenes no permitidas.',
          'Notificación automática inmediata por correo a los anfitriones al auditar.'
        ],
        recomendacionesEstrategicas: [
          'Mantener la moderación en tiempo real para agilizar la publicación.'
        ]
      };
    }
  }
}
