import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudAlojamiento, LiquidacionAnfitrion, MovimientoContable, AdminTab } from '../../core/types/admin.types';

@Component({
  selector: 'app-dashboard-feature',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Tarjetas de Métricas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Tarjeta 1: Volumen Transaccional -->
        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Volumen Bruto Procesado</span>
            <div class="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {{ totalTransaccionado | number:'1.2-2' }} <span class="text-sm font-semibold text-slate-500">BOB</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span class="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">↑ +14.2%</span>
              <span class="text-slate-500 dark:text-stone-500 font-normal">respecto al mes anterior</span>
            </div>
          </div>
        </div>

        <!-- Tarjeta 2: Ingresos por Comisiones -->
        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Ingresos por Comisiones</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">
              +{{ (totalTransaccionado * 0.1) | number:'1.2-2' }} <span class="text-sm font-semibold text-emerald-500">BOB</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span class="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">10% estándar</span>
              <span class="text-slate-500 dark:text-stone-500 font-normal">ingreso neto</span>
            </div>
          </div>
        </div>

        <!-- Tarjeta 3: Liquidaciones Pagadas -->
        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Liquidado a Anfitriones</span>
            <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-indigo-600 dark:text-indigo-300 font-sans tracking-tight">
              157,950.00 <span class="text-sm font-semibold text-indigo-400">BOB</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-600 dark:text-stone-400 font-semibold">
              <span class="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">98.4%</span>
              <span class="text-slate-500 dark:text-stone-500 font-normal">pagado a tiempo</span>
            </div>
          </div>
        </div>

        <!-- Tarjeta 4: Alojamientos Registrados -->
        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Alojamientos Habilitados</span>
            <div class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {{ alojamientos.length }} Propiedades
            </div>
            <div class="flex items-center gap-1.5 mt-1.5 text-[11px] text-cyan-600 dark:text-cyan-300 font-semibold">
              <span class="px-1.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30">9 Departamentos</span>
              <span class="text-slate-500 dark:text-stone-500 font-normal">cobertura país</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Gráfico Departamental & Actividad Reciente -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Ocupación por Región Turística -->
        <div class="lg:col-span-2 p-6 rounded-3xl liquid-card space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-serif text-lg font-bold text-slate-900 dark:text-white">Distribución de Reservas por Departamento</h3>
              <p class="text-xs text-slate-500 dark:text-stone-400 mt-0.5">Demanda turística consolidada en la plataforma nacional</p>
            </div>
            <span class="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold">
              ● En Tiempo Real
            </span>
          </div>

          <div class="space-y-4 pt-2">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1.5">
                <span class="text-slate-700 dark:text-stone-200">Santa Cruz (Chiquitanía, Metrópolis y Valles)</span>
                <span class="text-blue-600 dark:text-blue-400 font-mono font-bold">38% (69,800 BOB)</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-stone-800/80 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500" style="width: 38%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1.5">
                <span class="text-slate-700 dark:text-stone-200">La Paz (Lago Titicaca, Ciudad y Yungas)</span>
                <span class="text-sky-600 dark:text-sky-400 font-mono font-bold">26% (48,100 BOB)</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-stone-800/80 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500" style="width: 26%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1.5">
                <span class="text-slate-700 dark:text-stone-200">Cochabamba (Valle Alto, Chapare y Gastronomía)</span>
                <span class="text-indigo-600 dark:text-indigo-400 font-mono font-bold">18% (33,165 BOB)</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-stone-800/80 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-500" style="width: 18%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1.5">
                <span class="text-slate-700 dark:text-stone-200">Tarija (Ruta del Vino y Valle de la Concepción)</span>
                <span class="text-teal-600 dark:text-teal-400 font-mono font-bold">12% (22,110 BOB)</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-stone-800/80 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style="width: 12%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bandeja de Propiedades que requieren Atención -->
        <div class="p-6 rounded-3xl liquid-card space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-slate-900 dark:text-white">Moderación Prioritaria</h3>
            <button type="button" (click)="irATab.emit('alojamientos')" class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Ver todas →
            </button>
          </div>

          <div *ngIf="alojamientosAtencion.length === 0" class="py-8 text-center text-xs text-slate-400">
            No hay solicitudes pendientes ni observadas.
          </div>

          <div *ngIf="alojamientosAtencion.length > 0" class="space-y-3">
            <div *ngFor="let a of alojamientosAtencion.slice(0, 4)"
                 class="p-3.5 rounded-2xl border transition flex items-center justify-between gap-3"
                 [ngClass]="a.estado === 'OBSERVADO' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-50 dark:bg-stone-900 border-slate-200 dark:border-stone-800'">
              <div class="flex items-center gap-3 min-w-0">
                <img [src]="a.imagen" [alt]="a.titulo" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-stone-700" />
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ a.titulo }}</h4>
                  <p class="text-[11px] text-slate-500 dark:text-stone-400 truncate">{{ a.anfitrion }} • {{ a.ciudad }}</p>
                  <span class="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold"
                        [ngClass]="a.estado === 'OBSERVADO' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'">
                    {{ a.estado }}
                  </span>
                </div>
              </div>

              <button
                type="button"
                (click)="inspeccionarAlojamiento.emit(a)"
                class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 transition shadow-sm cursor-pointer"
              >
                Revisar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent {
  @Input() alojamientos: SolicitudAlojamiento[] = [];
  @Input() liquidaciones: LiquidacionAnfitrion[] = [];
  @Input() movimientos: MovimientoContable[] = [];

  @Output() irATab = new EventEmitter<AdminTab>();
  @Output() inspeccionarAlojamiento = new EventEmitter<SolicitudAlojamiento>();

  get totalTransaccionado(): number {
    return this.movimientos
      .filter(m => m.tipo === 'DEBITO')
      .reduce((acc, curr) => acc + curr.monto, 0) || 184250.00;
  }

  get alojamientosAtencion(): SolicitudAlojamiento[] {
    return this.alojamientos.filter(a => a.estado === 'OBSERVADO' || a.estado === 'PENDIENTE' || a.estado === 'EN_REVISION');
  }
}
