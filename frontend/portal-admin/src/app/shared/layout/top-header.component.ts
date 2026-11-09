import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminTab } from '../../core/types/admin.types';

@Component({
  selector: 'app-admin-top-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-20 border-b border-slate-200/80 dark:border-stone-800/80 px-8 flex items-center justify-between bg-white/95 dark:bg-carbon-900/95 sticky top-0 z-10 transition-colors">
      <div>
        <h2 class="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {{ titulo }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
          {{ subtitulo }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Indicador de Red / Conexión -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Red Nacional En Línea</span>
        </div>

        <!-- Botón Modo Claro / Oscuro -->
        <button
          type="button"
          (click)="toggleTheme.emit()"
          class="p-2.5 rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-white transition shadow-sm cursor-pointer"
          [title]="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        >
          <svg *ngIf="isDarkMode" class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg *ngIf="!isDarkMode" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </header>
  `
})
export class TopHeaderComponent {
  @Input() activeTab: AdminTab = 'dashboard';
  @Input() isDarkMode: boolean = true;
  @Output() toggleTheme = new EventEmitter<void>();

  get titulo(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Panel de Control Ejecutivo';
      case 'alojamientos': return 'Bandeja de Aprobación & Moderación';
      case 'contabilidad': return 'Registro de Transacciones & Liquidaciones';
      case 'liquidaciones': return 'Liquidaciones y Desembolsos a Anfitriones';
      case 'reportes-ia': return 'Analítica Estratégica & Reportes Inteligentes';
    }
  }

  get subtitulo(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Métricas consolidadas de transacciones, liquidaciones y demanda turística nacional';
      case 'alojamientos': return 'Inspección de estándares de habitabilidad y aprobación de anfitriones bolivianos';
      case 'contabilidad': return 'Auditoría de cobros QR Simple BNB, comisiones del 10% y transferencias bancarias';
      case 'liquidaciones': return 'Desembolsos periódicos a cuentas bancarias acreditadas en el sistema financiero';
      case 'reportes-ia': return 'Modelos predictivos de demanda, recomendaciones ejecutivas y proyecciones fiscales';
    }
  }
}
