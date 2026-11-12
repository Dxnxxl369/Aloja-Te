import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientoContable } from '../../core/types/admin.types';

@Component({
  selector: 'app-contabilidad-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Balance Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Total Debe (Recaudación QR)</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-black font-sans text-emerald-600 dark:text-emerald-400">
            {{ totalDebito | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-500">BOB</span>
          </div>
          <p class="text-[10px] text-slate-400 font-mono">Cobros QR/Transferencias Procesados</p>
        </div>

        <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Total Haber (Egresos & Comisiones)</span>
            <div class="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </div>
          </div>
          <div class="text-2xl font-black font-sans text-blue-600 dark:text-blue-400">
            {{ totalCredito | number:'1.2-2' }} <span class="text-xs font-semibold text-slate-500">BOB</span>
          </div>
          <p class="text-[10px] text-slate-400 font-mono">Liquidación Neta + Comisión</p>
        </div>

        <div class="p-5 rounded-2xl liquid-card liquid-card-hover flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Auditoría Partida Doble</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold inline-flex items-center gap-1">
              <svg class="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Cuadrado</span>
            </span>
          </div>
          <div class="text-xs font-semibold text-slate-700 dark:text-stone-300">
            Diferencia Contable: <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.00 BOB</span>
          </div>
          <button type="button"
                  (click)="exportarExcel.emit()"
                  class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-bold text-slate-700 dark:text-stone-200 border border-slate-200 dark:border-stone-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
            <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar Libro Diario CSV</span>
          </button>
        </div>
      </div>

      <!-- Tabla y Filtros -->
      <div class="p-6 rounded-3xl liquid-card space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 w-full sm:w-auto">
            <button type="button"
                    (click)="filtroTipo = 'TODOS'"
                    class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    [ngClass]="filtroTipo === 'TODOS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white'">
              Todos
            </button>
            <button type="button"
                    (click)="filtroTipo = 'DEBITO'"
                    class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    [ngClass]="filtroTipo === 'DEBITO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-stone-400 hover:text-emerald-500'">
              Débitos
            </button>
            <button type="button"
                    (click)="filtroTipo = 'CREDITO'"
                    class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    [ngClass]="filtroTipo === 'CREDITO' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-stone-400 hover:text-blue-500'">
              Créditos
            </button>
          </div>

          <div class="relative w-full sm:w-72">
            <input type="text"
                   [(ngModel)]="busquedaContable"
                   placeholder="Buscar cuenta o asiento..."
                   class="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-xs text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-stone-800">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 dark:bg-carbon-950/80 text-slate-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-stone-800">
              <tr>
                <th class="py-3.5 px-4">Asiento</th>
                <th class="py-3.5 px-4">Cuenta Contable</th>
                <th class="py-3.5 px-4">Tipo</th>
                <th class="py-3.5 px-4">Origen / OrigenTipo</th>
                <th class="py-3.5 px-4 text-right">Monto</th>
                <th class="py-3.5 px-4 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-stone-800/60 text-slate-700 dark:text-stone-300">
              <tr *ngIf="movimientosFiltrados.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400">
                  No se encontraron asientos contables registrados.
                </td>
              </tr>
              <tr *ngFor="let m of movimientosFiltrados" class="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition">
                <td class="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                  {{ m.asientoId }}
                </td>
                <td class="py-3.5 px-4 font-medium">
                  {{ m.cuenta }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        [ngClass]="m.tipo === 'DEBITO' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300'">
                    {{ m.tipo }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-500 dark:text-stone-400 font-mono text-[11px]">
                  {{ m.origenTipo }}
                </td>
                <td class="py-3.5 px-4 text-right font-mono font-bold"
                    [ngClass]="m.tipo === 'DEBITO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'">
                  {{ m.monto | number:'1.2-2' }} BOB
                </td>
                <td class="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                  {{ m.createdAt | date:'short' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ContabilidadComponent {
  @Input() movimientos: MovimientoContable[] = [];
  @Output() exportarExcel = new EventEmitter<void>();

  filtroTipo: 'TODOS' | 'DEBITO' | 'CREDITO' = 'TODOS';
  busquedaContable: string = '';

  get totalDebito(): number {
    return this.movimientos
      .filter(m => m.tipo === 'DEBITO')
      .reduce((acc, curr) => acc + curr.monto, 0);
  }

  get totalCredito(): number {
    return this.movimientos
      .filter(m => m.tipo === 'CREDITO')
      .reduce((acc, curr) => acc + curr.monto, 0);
  }

  get movimientosFiltrados(): MovimientoContable[] {
    return this.movimientos.filter(m => {
      const matchTipo = this.filtroTipo === 'TODOS' || m.tipo === this.filtroTipo;
      const matchSearch = !this.busquedaContable ||
        m.cuenta.toLowerCase().includes(this.busquedaContable.toLowerCase()) ||
        m.asientoId.toLowerCase().includes(this.busquedaContable.toLowerCase());
      return matchTipo && matchSearch;
    });
  }
}
