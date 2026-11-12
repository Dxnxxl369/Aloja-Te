import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminTab } from '../../core/types/admin.types';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      flex-shrink: 0;
    }
  `],
  template: `
    <!-- Barra Lateral Institucional Fija -->
    <aside class="w-72 h-full border-r border-slate-200/80 dark:border-stone-800/80 bg-white dark:bg-carbon-900/95 flex flex-col justify-between shrink-0 relative z-20 transition-colors select-none">
      
      <!-- Parte Superior: Logotipo + Navegación Scrollable Interna -->
      <div class="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        <!-- Logotipo Institucional -->
        <div class="h-20 px-6 border-b border-slate-200/80 dark:border-stone-800/80 flex items-center gap-3.5 shrink-0">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-serif font-black text-xl shadow-lg shadow-blue-500/25 shrink-0">
            A
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">Aloja-Te</span>
              <span class="text-[9px] uppercase font-bold tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                NACIONAL
              </span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-stone-400 font-medium tracking-wide">Dirección de Auditoría & Control</p>
          </div>
        </div>

        <!-- Navegación Principal -->
        <div class="p-4 space-y-1.5 flex-1">
          <span class="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider px-3 mb-2 block">
            Módulos de Gestión
          </span>

          <!-- Tab 1: Dashboard -->
          <button
            type="button"
            (click)="seleccionar('dashboard')"
            [class]="activeTab === 'dashboard' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all cursor-pointer' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all cursor-pointer'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Panel General</span>
          </button>

          <!-- Tab 2: Contabilidad -->
          <button
            type="button"
            (click)="seleccionar('contabilidad')"
            [class]="activeTab === 'contabilidad' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all cursor-pointer' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all cursor-pointer'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Transacciones & Liquidaciones</span>
          </button>

          <!-- Tab 3: Alojamientos -->
          <button
            type="button"
            (click)="seleccionar('alojamientos')"
            [class]="activeTab === 'alojamientos' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all cursor-pointer' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all cursor-pointer'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <div class="flex-1 flex items-center justify-between">
              <span>Verificación de Alojamientos</span>
              <div class="flex items-center gap-1">
                <span *ngIf="conteoPendientes > 0" class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                  {{ conteoPendientes }}
                </span>
                <span *ngIf="conteoObservados > 0" class="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm">
                  {{ conteoObservados }}
                </span>
              </div>
            </div>
          </button>

          <!-- Tab 4: Liquidaciones -->
          <button
            type="button"
            (click)="seleccionar('liquidaciones')"
            [class]="activeTab === 'liquidaciones' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all cursor-pointer' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all cursor-pointer'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Liquidaciones a Anfitriones</span>
          </button>

          <!-- Tab 5: Reportes IA -->
          <button
            type="button"
            (click)="seleccionar('reportes-ia')"
            [class]="activeTab === 'reportes-ia' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all cursor-pointer' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all cursor-pointer'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div class="flex-1 flex items-center justify-between">
              <span>Reportes IA</span>              
            </div>
          </button>

          <!-- Tab 6: Gestión de Usuarios -->
          <button
            type="button"
            (click)="seleccionar('usuarios')"
            [class]="activeTab === 'usuarios' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all cursor-pointer' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all cursor-pointer'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div class="flex-1 flex items-center justify-between">
              <span>Gestión de Usuarios</span>              
            </div>
          </button>

          <!-- Tab 7: Mi Perfil -->
          <button
            type="button"
            (click)="seleccionar('perfil')"
            [class]="activeTab === 'perfil' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all cursor-pointer' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all cursor-pointer'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Mi Perfil Administrador</span>
          </button>
        </div>
      </div>

      <!-- Pie de Barra Lateral (Pinned en el Footer): Cerrar Sesión & Perfil -->
      <div class="p-4 border-t border-slate-200/80 dark:border-stone-800/80 bg-slate-50/60 dark:bg-stone-900/60 space-y-2.5 shrink-0">
        
        <!-- Botón Cerrar Sesión (Arriba del Perfil) -->
        <button
          type="button"
          (click)="onCerrarSesion.emit()"
          class="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-stone-800/80 dark:hover:bg-rose-950/40 text-slate-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group shadow-sm"
        >
          <svg class="w-4 h-4 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>

        <!-- Ficha de Perfil del Administrador & Toggle de Tema -->
        <div class="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div (click)="seleccionar('perfil')" class="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-85 transition" title="Ir a Mi Perfil">
            <div class="relative shrink-0">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                AA
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-stone-900 animate-pulse"></span>
            </div>
            <div class="overflow-hidden">
              <div class="text-xs font-bold text-slate-900 dark:text-white truncate">Admin Aloja-Te</div>
              <div class="text-[10px] text-blue-600 dark:text-blue-400 font-mono truncate">Auditoría Global</div>
            </div>
          </div>

          <!-- Switch Modo Claro / Oscuro -->
          <button
            type="button"
            (click)="onToggleTheme.emit()"
            class="p-2 rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-800 text-slate-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-white transition shadow-sm cursor-pointer shrink-0 ml-1.5"
            [title]="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <!-- Icono Sol (Modo Claro) -->
            <svg *ngIf="isDarkMode" class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Icono Luna (Modo Oscuro) -->
            <svg *ngIf="!isDarkMode" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>

      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() activeTab: AdminTab = 'dashboard';
  @Input() conteoPendientes: number = 0;
  @Input() conteoObservados: number = 0;
  @Input() isDarkMode: boolean = true;
  @Output() tabCambiado = new EventEmitter<AdminTab>();
  @Output() onToggleTheme = new EventEmitter<void>();
  @Output() onCerrarSesion = new EventEmitter<void>();

  seleccionar(tab: AdminTab) {
    this.tabCambiado.emit(tab);
  }
}
