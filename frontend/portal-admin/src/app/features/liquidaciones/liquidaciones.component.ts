import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidacionAnfitrion } from '../../core/types/admin.types';

@Component({
  selector: 'app-liquidaciones-feature',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Total Liquidado a Anfitriones</span>
          <div class="text-2xl font-black font-sans text-slate-900 dark:text-white">
            {{ totalNetoPagado | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-500">BOB</span>
          </div>
          <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {{ liquidaciones.length > 0 ? (totalNetoPagado > 0 ? 'Desembolsos confirmados' : 'Sin desembolsos previos') : 'Sin operaciones' }}
          </p>
        </div>

        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Comisión Aloja-Te (10%)</span>
          <div class="text-2xl font-black font-sans text-emerald-600 dark:text-emerald-400">
            {{ totalComisiones | number:'1.2-2' }} <span class="text-xs font-semibold text-emerald-500">BOB</span>
          </div>
          <p class="text-[10px] text-slate-400 font-mono">Retención directa sobre cobros de reserva</p>
        </div>

        <div class="p-5 rounded-2xl liquid-card liquid-card-hover flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Pendiente de Transferir</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
              {{ conteoPendientes }} lotes
            </span>
          </div>
          <div class="text-2xl font-black font-sans text-amber-600 dark:text-amber-400">
            {{ totalPendiente | number:'1.2-2' }} <span class="text-xs font-semibold text-amber-500">BOB</span>
          </div>
          <button type="button"
                  (click)="autorizarLote.emit()"
                  [disabled]="conteoPendientes === 0"
                  class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Autorizar Lote de Liquidaciones</span>
          </button>
        </div>
      </div>

      <!-- Tabla de Liquidaciones -->
      <div class="overflow-x-auto rounded-3xl border border-slate-200 dark:border-stone-800/80 liquid-card">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100 dark:bg-carbon-950/80 text-slate-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-stone-800">
            <tr>
              <th class="py-4 px-5">Anfitrión / Propiedad</th>
              <th class="py-4 px-5">Entidad Financiera</th>
              <th class="py-4 px-5 text-right">Importe Bruto</th>
              <th class="py-4 px-5 text-right">Comisión Plataforma (10%)</th>
              <th class="py-4 px-5 text-right">Retención SIN</th>
              <th class="py-4 px-5 text-right">Neto a Transferir</th>
              <th class="py-4 px-5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-stone-800/60 text-slate-700 dark:text-stone-300">
            <tr *ngIf="liquidaciones.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                No hay liquidaciones a anfitriones registradas en el sistema.
              </td>
            </tr>
            <tr *ngFor="let l of liquidaciones" class="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition">
              <td class="py-3.5 px-5">
                <div class="font-bold text-slate-900 dark:text-white">{{ l.anfitrion }}</div>
                <div class="text-[11px] text-slate-500 dark:text-stone-400">{{ l.alojamiento }}</div>
              </td>
              <td class="py-3.5 px-5">
                <span class="font-semibold text-slate-900 dark:text-white">{{ l.banco }}</span>
                <div class="font-mono text-[11px] text-slate-500 dark:text-stone-400">{{ l.numeroCuenta }}</div>
              </td>
              <td class="py-3.5 px-5 font-mono text-right text-slate-700 dark:text-stone-300">
                {{ l.montoBruto.toFixed(2) }} BOB
              </td>
              <td class="py-3.5 px-5 font-mono text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ l.comisionPlataforma.toFixed(2) }} BOB
              </td>
              <td class="py-3.5 px-5 font-mono text-right text-slate-500">
                {{ l.retencionImpuestos.toFixed(2) }} BOB
              </td>
              <td class="py-3.5 px-5 font-mono text-right font-black text-slate-900 dark:text-white text-sm">
                {{ l.montoNeto.toFixed(2) }} BOB
              </td>
              <td class="py-3.5 px-5 text-center">
                <span [ngClass]="{
                  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800': l.estado === 'PAGADO',
                  'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800': l.estado === 'PENDIENTE',
                  'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800': l.estado === 'EN_PROCESO'
                }" class="px-2.5 py-1 rounded-xl text-[10px] font-bold border">
                  {{ l.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LiquidacionesComponent {
  @Input() liquidaciones: LiquidacionAnfitrion[] = [];
  @Output() autorizarLote = new EventEmitter<void>();

  get totalNetoPagado(): number {
    return this.liquidaciones
      .filter(l => l.estado === 'PAGADO')
      .reduce((acc, curr) => acc + curr.montoNeto, 0);
  }

  get totalComisiones(): number {
    return this.liquidaciones
      .reduce((acc, curr) => acc + curr.comisionPlataforma, 0);
  }

  get totalPendiente(): number {
    return this.liquidaciones
      .filter(l => l.estado === 'PENDIENTE')
      .reduce((acc, curr) => acc + curr.montoNeto, 0);
  }

  get conteoPendientes(): number {
    return this.liquidaciones.filter(l => l.estado === 'PENDIENTE').length;
  }
}
