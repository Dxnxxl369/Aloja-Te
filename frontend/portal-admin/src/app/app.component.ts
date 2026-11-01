import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MovimientoContable {
  movimientoId: number;
  asientoId: string;
  cuenta: string;
  tipo: 'DEBITO' | 'CREDITO';
  monto: number;
  origenTipo: string;
  createdAt: string;
}

export interface UnidadAdmin {
  idUnidad: string;
  nombre: string;
  capacidadHuespedes: number;
  cantidadCamas: number;
  cantidadBanos: number;
  inventarioTotal: number;
  precioNoche: number;
  estado: string;
  fotos?: string[];
  descripcion?: string;
}

export interface SolicitudAlojamiento {
  id: string;
  titulo: string;
  anfitrion: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  tipoPropiedad: string;
  modalidad: 'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL' | string;
  precioNoche: number;
  capacidad: number;
  habitaciones: number;
  estado: 'PENDIENTE' | 'EN_REVISION' | 'PUBLICADO' | 'OBSERVADO' | 'SUSPENDIDO' | 'RECHAZADO';
  motivoObservacionRechazo?: string;
  origenUltimoCambio?: string;
  fechaRegistro: string;
  imagen: string;
  fotos?: string[];
  descripcion: string;
  politicas?: string;
  horarioEntrada?: string;
  horarioSalida?: string;
  motivoRechazo?: string;
  unidades?: UnidadAdmin[];
  servicios?: string[];
}

export interface LiquidacionAnfitrion {
  id: string;
  anfitrion: string;
  alojamiento: string;
  banco: string;
  numeroCuenta: string;
  montoBruto: number;
  comisionPlataforma: number;
  retencionImpuestos: number;
  montoNeto: number;
  estado: 'PAGADO' | 'PENDIENTE' | 'EN_PROCESO';
  fechaLiquidacion: string;
}

export interface ReporteGenerativo {
  titulo: string;
  categoria: string;
  periodo: string;
  fechaEmision: string;
  resumenEjecutivo: string;
  kpis: { etiqueta: string; valor: string; variacion: string; esPositivo: boolean }[];
  puntosClave: string[];
  recomendacionesEstrategicas: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex bg-slate-50 dark:bg-carbon-950 text-slate-900 dark:text-stone-100 font-sans selection:bg-blue-600/30 selection:text-white transition-colors duration-300">
      
      <!-- ========================================== -->
      <!-- BARRA LATERAL (SIDEBAR INSTITUCIONAL)      -->
      <!-- ========================================== -->
      <aside class="w-72 border-r border-slate-200/80 dark:border-stone-800/80 bg-white dark:bg-carbon-900/95 flex flex-col justify-between shrink-0 relative z-20 transition-colors">
        <div>
          <!-- Logotipo Institucional -->
          <div class="h-20 px-6 border-b border-slate-200/80 dark:border-stone-800/80 flex items-center gap-3.5">
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
          <div class="p-4 space-y-1.5">
            <span class="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider px-3 mb-2 block">
              Módulos de Gestión
            </span>

            <!-- Tab 1: Dashboard -->
            <button
              (click)="cambiarTab('dashboard')"
              [class]="activeTab === 'dashboard' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Panel General</span>
            </button>

            <!-- Tab 2: Contabilidad -->
            <button
              (click)="cambiarTab('contabilidad')"
              [class]="activeTab === 'contabilidad' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Transacciones &amp; Liquidaciones</span>
            </button>

            <!-- Tab 3: Alojamientos -->
            <button
              (click)="cambiarTab('alojamientos')"
              [class]="activeTab === 'alojamientos' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <div class="flex-1 flex items-center justify-between">
                <span>Verificación de Alojamientos</span>
                <span class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">{{ conteoPendientes() }} pend.</span>
              </div>
            </button>

            <!-- Tab 4: Liquidaciones -->
            <button
              (click)="cambiarTab('liquidaciones')"
              [class]="activeTab === 'liquidaciones' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 scale-[1.01] transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Liquidaciones a Anfitriones</span>
            </button>

            <!-- Tab 5: Reportes IA -->
            <button
              (click)="cambiarTab('reportes-ia')"
              [class]="activeTab === 'reportes-ia' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 scale-[1.01] transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0 text-cyan-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div class="flex-1 flex items-center justify-between">
                <span>Reportes Inteligentes</span>
                <span class="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-800">IA</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Perfil Administrativo & Enlace de Retorno -->
        <div class="p-4 border-t border-slate-200/80 dark:border-stone-800/80 space-y-3">
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-stone-900/80 border border-slate-200 dark:border-stone-800/80 flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-white/10 flex items-center justify-center font-bold text-xs text-white shadow-md">
                AQ
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-stone-900 animate-pulse"></span>
            </div>
            <div class="overflow-hidden">
              <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">Lic. Andrea Quiroga</h5>
              <p class="text-[10px] text-blue-600 dark:text-blue-400 truncate font-medium">Auditora General</p>
            </div>
          </div>

          <a
            href="http://localhost:3000"
            class="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-stone-900/60 hover:bg-blue-50 dark:hover:bg-blue-600/10 border border-slate-200 dark:border-stone-800 text-[11px] text-slate-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center justify-center gap-2 transition group"
          >
            <svg class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ir al Catálogo Público</span>
          </a>
        </div>
      </aside>

      <!-- ========================================== -->
      <!-- CONTENEDOR PRINCIPAL                       -->
      <!-- ========================================== -->
      <div class="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        
        <!-- Barra Superior (Header Ejecutivo) -->
        <header class="h-20 border-b border-slate-200/80 dark:border-stone-800/80 bg-white/90 dark:bg-carbon-900/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10 transition-colors">
          <div>
            <h1 class="font-serif text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {{ obtenerTituloVista() }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
              {{ obtenerSubtituloVista() }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <!-- Indicador Operativo -->
            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Operaciones en Línea</span>
            </div>

            <!-- Selector de Período Fiscal -->
            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-stone-900/90 border border-slate-200 dark:border-stone-800 text-xs text-slate-700 dark:text-stone-300">
              <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">Gestión Fiscal 2026 — Octubre</span>
            </div>

            <!-- Selector de Modo Claro / Modo Oscuro con Persistencia -->
            <button
              type="button"
              (click)="toggleTheme()"
              [title]="isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'"
              class="px-3.5 py-1.5 rounded-xl border transition flex items-center gap-2 text-xs font-semibold shadow-sm cursor-pointer"
              [class]="isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800' : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'"
            >
              <svg *ngIf="isDarkMode" class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg *ngIf="!isDarkMode" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>{{ isDarkMode ? 'Modo Oscuro' : 'Modo Claro' }}</span>
            </button>
          </div>
        </header>

        <!-- Contenido Dinámico por Pestaña -->
        <main class="p-8 space-y-8 max-w-7xl w-full">

          <!-- ======================================================== -->
          <!-- VISTA 1: PANEL GENERAL (DASHBOARD EJECUTIVO)             -->
          <!-- ======================================================== -->
          <div *ngIf="activeTab === 'dashboard'" class="space-y-8 animate-fade-in">
            
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
                  <div class="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">184,250.00 BOB</div>
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
                  <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">+18,425.00 BOB</div>
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
                  <div class="text-3xl font-black text-indigo-600 dark:text-indigo-300 font-sans tracking-tight">157,950.00 BOB</div>
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
                  <div class="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">342 Propiedades</div>
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
                      <span class="text-slate-700 dark:text-stone-200">Potosí (Salar de Uyuni y Casco Colonial)</span>
                      <span class="text-cyan-600 dark:text-cyan-400 font-mono font-bold">11% (20,267 BOB)</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-stone-800/80 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style="width: 11%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs font-semibold mb-1.5">
                      <span class="text-slate-700 dark:text-stone-200">Beni, Chuquisaca, Tarija, Oruro y Pando</span>
                      <span class="text-emerald-600 dark:text-emerald-400 font-mono font-bold">7% (12,918 BOB)</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-stone-800/80 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style="width: 7%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Registro de Auditoría y Eventos Recientes -->
              <div class="p-6 rounded-3xl liquid-card space-y-4">
                <h3 class="font-serif text-lg font-bold text-slate-900 dark:text-white">Eventos Recientes</h3>
                <p class="text-xs text-slate-500 dark:text-stone-400">Trazabilidad de operaciones en plataforma</p>

                <div class="space-y-3 pt-2 text-xs">
                  <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-900/80 border border-slate-200 dark:border-stone-800/80 space-y-1 hover:border-emerald-500/30 transition">
                    <div class="flex items-center justify-between">
                      <span class="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Cobro QR Confirmado
                      </span>
                      <span class="text-[10px] text-slate-400 dark:text-stone-500 font-mono">Hace 4 min</span>
                    </div>
                    <p class="text-slate-700 dark:text-stone-300">Reserva de 3 noches en Cabaña Chiquitana por 1,950 BOB.</p>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-900/80 border border-slate-200 dark:border-stone-800/80 space-y-1 hover:border-blue-500/30 transition">
                    <div class="flex items-center justify-between">
                      <span class="text-blue-600 dark:text-blue-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        Asiento Contable Generado
                      </span>
                      <span class="text-[10px] text-slate-400 dark:text-stone-500 font-mono">Hace 12 min</span>
                    </div>
                    <p class="text-slate-700 dark:text-stone-300">Folio contable #d3d94209 con débito en Banco BNB y retención de comisión.</p>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-900/80 border border-slate-200 dark:border-stone-800/80 space-y-1 hover:border-indigo-500/30 transition">
                    <div class="flex items-center justify-between">
                      <span class="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Solicitud de Alojamiento
                      </span>
                      <span class="text-[10px] text-slate-400 dark:text-stone-500 font-mono">Hace 1 hora</span>
                    </div>
                    <p class="text-slate-700 dark:text-stone-300">Cabaña Ecológica Samaipata registrada por anfitrión y en espera de revisión.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ======================================================== -->
          <!-- VISTA 2: AUDITORÍA CONTABLE (LIBRO DIARIO)               -->
          <!-- ======================================================== -->
          <div *ngIf="activeTab === 'contabilidad'" class="space-y-6 animate-fade-in">
            
            <!-- Resumen Financiero en Tiempo Real -->
            <div class="p-6 rounded-3xl liquid-card border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                  Conciliación Bancaria y Recaudación
                </span>
                <h3 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">Registro de Transacciones &amp; Liquidaciones</h3>
                <p class="text-xs text-slate-500 dark:text-stone-400">Auditoría de cobros QR Simple BNB, comisiones de plataforma (10%) y pagos a anfitriones</p>
              </div>

              <!-- Indicador de Conciliación -->
              <div class="flex items-center gap-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-900/90 border border-slate-200 dark:border-stone-800 px-5 shadow-sm">
                <div>
                  <span class="text-[10px] text-slate-500 dark:text-stone-400 block font-semibold uppercase">TOTAL RECAUDADO</span>
                  <span class="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">{{ calcularTotalDebito().toFixed(2) }} BOB</span>
                </div>
                <div class="w-px h-8 bg-slate-200 dark:bg-stone-800"></div>
                <div>
                  <span class="text-[10px] text-slate-500 dark:text-stone-400 block font-semibold uppercase">TOTAL DISTRIBUIDO</span>
                  <span class="font-mono text-base font-black text-blue-600 dark:text-blue-400">{{ calcularTotalCredito().toFixed(2) }} BOB</span>
                </div>
                <div class="w-px h-8 bg-slate-200 dark:bg-stone-800"></div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-300">CONCILIADO BNB</span>
                </div>
              </div>
            </div>

            <!-- Filtros de Búsqueda de Movimientos -->
            <div class="flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button
                  (click)="filtroTipo = 'TODOS'"
                  [class]="filtroTipo === 'TODOS' ? 'px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' : 'px-4 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
                >
                  Todos los Movimientos
                </button>
                <button
                  (click)="filtroTipo = 'DEBITO'"
                  [class]="filtroTipo === 'DEBITO' ? 'px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20' : 'px-4 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
                >
                  Ingresos (Cobros QR)
                </button>
                <button
                  (click)="filtroTipo = 'CREDITO'"
                  [class]="filtroTipo === 'CREDITO' ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20' : 'px-4 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
                >
                  Distribución &amp; Comisiones
                </button>
              </div>

              <div class="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  [(ngModel)]="busquedaContable"
                  placeholder="Buscar cuenta o folio..."
                  class="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-slate-300 dark:border-stone-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-stone-500 focus:outline-none focus:border-blue-500 transition w-full sm:w-64 text-xs"
                />
                <button
                  (click)="cargarMovimientos()"
                  class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 hover:text-slate-900 dark:text-stone-300 dark:hover:text-white font-semibold transition shrink-0 border border-slate-200 dark:border-stone-700"
                >
                  Actualizar
                </button>
              </div>
            </div>

            <!-- Tabla de Transacciones Financieras -->
            <div class="overflow-x-auto rounded-3xl border border-slate-200 dark:border-stone-800/80 liquid-card">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 dark:bg-carbon-950/80 text-slate-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-stone-800">
                  <tr>
                    <th class="py-4 px-5">Referencia</th>
                    <th class="py-4 px-5">Concepto Financiero</th>
                    <th class="py-4 px-5">Tipo</th>
                    <th class="py-4 px-5 text-right">Ingreso QR (BOB)</th>
                    <th class="py-4 px-5 text-right">Distribución (BOB)</th>
                    <th class="py-4 px-5">Origen</th>
                    <th class="py-4 px-5">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-stone-800/60 text-slate-700 dark:text-stone-300">
                  <tr *ngFor="let m of movimientosFiltrados()" class="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition">
                    <td class="py-3.5 px-5 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      {{ m.asientoId.substring(0, 13) }}...
                    </td>
                    <td class="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                      {{ m.cuenta }}
                    </td>
                    <td class="py-3.5 px-5">
                      <span [class]="m.tipo === 'DEBITO' ? 'px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800' : 'px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800'">
                        {{ m.tipo }}
                      </span>
                    </td>
                    <td class="py-3.5 px-5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                      {{ m.tipo === 'DEBITO' ? m.monto.toFixed(2) : '-' }}
                    </td>
                    <td class="py-3.5 px-5 font-mono font-bold text-blue-600 dark:text-blue-400 text-right">
                      {{ m.tipo === 'CREDITO' ? m.monto.toFixed(2) : '-' }}
                    </td>
                    <td class="py-3.5 px-5 text-slate-500 dark:text-stone-400 text-[11px]">
                      {{ m.origenTipo }}
                    </td>
                    <td class="py-3.5 px-5 text-slate-500 dark:text-stone-400 text-[11px] font-mono">
                      {{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- ======================================================== -->
          <!-- VISTA 3: VERIFICACIÓN Y CALIFICACIÓN DE ALOJAMIENTOS     -->
          <!-- ======================================================== -->
          <div *ngIf="activeTab === 'alojamientos'" class="space-y-6 animate-fade-in">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">Bandeja de Aprobación &amp; Moderación</h3>
                <p class="text-xs text-slate-500 dark:text-stone-400 mt-0.5">Control de calidad técnica, validación de licencias y moderación de ofertas únicas vs. establecimientos hoteleros</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  (click)="cargarAlojamientos()"
                  class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 hover:bg-slate-200 dark:hover:bg-stone-800 hover:border-blue-500/30 text-slate-700 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition flex items-center gap-2 shadow-sm"
                >
                  <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sincronizar MS-01</span>
                </button>
              </div>
            </div>

            <!-- Filtros de Estado Oficiales (6 Estados) -->
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <button
                (click)="filtroAlojamientos = 'TODOS'"
                [class]="filtroAlojamientos === 'TODOS' ? 'px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' : 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
              >
                Todos ({{ alojamientos.length }})
              </button>
              <button
                (click)="filtroAlojamientos = 'PENDIENTE'"
                [class]="filtroAlojamientos === 'PENDIENTE' ? 'px-3.5 py-2 rounded-xl bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/20' : 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
              >
                🕒 Pendientes ({{ conteoPendientes() }})
              </button>
              <button
                (click)="filtroAlojamientos = 'EN_REVISION'"
                [class]="filtroAlojamientos === 'EN_REVISION' ? 'px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' : 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
              >
                🔍 En Revisión ({{ conteoEnRevision() }})
              </button>
              <button
                (click)="filtroAlojamientos = 'PUBLICADO'"
                [class]="filtroAlojamientos === 'PUBLICADO' ? 'px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20' : 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
              >
                ✅ Publicados ({{ conteoPublicados() }})
              </button>
              <button
                (click)="filtroAlojamientos = 'OBSERVADO'"
                [class]="filtroAlojamientos === 'OBSERVADO' ? 'px-3.5 py-2 rounded-xl bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
              >
                ⚠️ Observados ({{ conteoObservados() }})
              </button>
              <button
                (click)="filtroAlojamientos = 'SUSPENDIDO'"
                [class]="filtroAlojamientos === 'SUSPENDIDO' ? 'px-3.5 py-2 rounded-xl bg-slate-700 text-white font-semibold shadow-md shadow-slate-700/20' : 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
              >
                ⛔ Suspendidos ({{ conteoSuspendidos() }})
              </button>
              <button
                (click)="filtroAlojamientos = 'RECHAZADO'"
                [class]="filtroAlojamientos === 'RECHAZADO' ? 'px-3.5 py-2 rounded-xl bg-rose-700 text-white font-semibold shadow-md shadow-rose-700/20' : 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-stone-800 border border-slate-200 dark:border-stone-800 font-medium transition'"
              >
                ❌ Rechazados ({{ conteoRechazados() }})
              </button>
            </div>

            <!-- Listado de Alojamientos -->
            <div *ngIf="alojamientosFiltrados().length === 0" class="p-12 text-center rounded-3xl liquid-card border-dashed border-slate-300 dark:border-stone-800 text-slate-500 dark:text-stone-400 text-xs">
              No hay alojamientos registrados en esta categoría de moderación.
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div *ngFor="let a of alojamientosFiltrados()" class="p-5 rounded-3xl liquid-card liquid-card-hover space-y-4 flex flex-col justify-between">
                
                <div class="space-y-3">
                  <!-- Header con Estado & Modalidad -->
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                          {{ a.departamento }} • {{ a.tipoPropiedad }}
                        </span>
                        
                        <!-- Badge Modalidad (Casa vs Hotel) -->
                        <span *ngIf="a.modalidad === 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                          🏨 Hotel / Hostal (Multihabitación)
                        </span>
                        <span *ngIf="a.modalidad !== 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          🏡 Casa / Depto (Oferta Única)
                        </span>
                      </div>

                      <h4 (click)="inspeccionarAlojamiento(a, 'general')" class="font-serif text-lg font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 transition">{{ a.titulo }}</h4>
                      <p class="text-xs text-slate-500 dark:text-stone-400">Anfitrión: <strong class="text-slate-700 dark:text-stone-300">{{ a.anfitrion }}</strong> • {{ a.ciudad }}</p>
                    </div>

                    <!-- Badge Estado Oficial -->
                    <span [ngClass]="{
                      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800': a.estado === 'PUBLICADO',
                      'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800': a.estado === 'PENDIENTE',
                      'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800': a.estado === 'EN_REVISION',
                      'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800': a.estado === 'OBSERVADO',
                      'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700': a.estado === 'SUSPENDIDO',
                      'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800': a.estado === 'RECHAZADO'
                    }" class="px-2.5 py-1 rounded-xl text-[11px] font-bold border shrink-0">
                      {{ a.estado === 'PUBLICADO' ? '● Publicado' : (a.estado === 'PENDIENTE' ? '🕒 Pendiente' : (a.estado === 'EN_REVISION' ? '🔍 En Revisión' : (a.estado === 'OBSERVADO' ? '⚠️ Observado' : (a.estado === 'SUSPENDIDO' ? '⛔ Suspendido' : '❌ Rechazado')))) }}
                    </span>
                  </div>

                  <!-- Imagen de Portada con Lightbox Directo -->
                  <div class="h-48 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-stone-800 group cursor-pointer" (click)="abrirFotoLightbox(a.imagen, 0, a.fotos)">
                    <img [src]="a.imagen" [alt]="a.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div class="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-bold font-mono border border-white/10 shadow-lg">
                      {{ a.precioNoche }} BOB / noche
                    </div>
                    <div class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>🔍 Ampliar Foto</span>
                    </div>
                  </div>

                  <p class="text-xs text-slate-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {{ a.descripcion }}
                  </p>

                  <!-- Motivo de Rechazo / Observación (si aplica) -->
                  <div *ngIf="a.motivoRechazo" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px]">
                    <strong class="font-semibold block mb-0.5 text-rose-800 dark:text-rose-200">Observación Registrada:</strong>
                    {{ a.motivoRechazo }}
                  </div>

                  <!-- Ficha de Modalidad, Capacidad y Horarios -->
                  <div class="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-stone-400 pt-2 border-t border-slate-200 dark:border-stone-800">
                    <div class="flex items-center justify-between">
                      <button *ngIf="a.modalidad === 'HOTEL_HOSTAL'"
                              type="button"
                              (click)="inspeccionarAlojamiento(a, 'habitaciones')"
                              class="text-indigo-600 dark:text-indigo-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer text-left">
                        🏨 {{ a.unidades?.length || 1 }} Tipos de habitación configurados
                      </button>
                      <span *ngIf="a.modalidad !== 'HOTEL_HOSTAL'">
                        👥 {{ a.capacidad }} Huéspedes • 🛏️ {{ a.habitaciones }} Dormitorios
                      </span>
                      <span class="text-[11px] font-mono text-slate-400 dark:text-stone-500">
                        Reg: {{ a.fechaRegistro | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                    
                    <div class="text-[11px] text-slate-500 dark:text-stone-400">
                      ⏰ Check-in: <strong class="text-slate-700 dark:text-stone-300">{{ a.horarioEntrada || '14:00' }}</strong> | Check-out: <strong class="text-slate-700 dark:text-stone-300">{{ a.horarioSalida || '11:00' }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Botonera de Decisiones Oficial (6 Estados) -->
                <div class="pt-3 border-t border-slate-200/80 dark:border-stone-800/80 flex items-center gap-2 flex-wrap">
                  <button
                    *ngIf="a.estado === 'PENDIENTE'"
                    (click)="iniciarRevision(a.id)"
                    class="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1 min-w-[120px]"
                  >
                    <span>🔍 Iniciar Revisión</span>
                  </button>

                  <button
                    *ngIf="a.estado !== 'PUBLICADO'"
                    (click)="aprobarAlojamiento(a.id)"
                    class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1 min-w-[110px]"
                  >
                    <span>✓ Publicar</span>
                  </button>

                  <button
                    *ngIf="a.estado === 'PENDIENTE' || a.estado === 'EN_REVISION'"
                    (click)="abrirModalObservacion(a)"
                    class="flex-1 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition flex items-center justify-center gap-1 min-w-[95px]"
                  >
                    <span>⚠️ Observar</span>
                  </button>

                  <button
                    *ngIf="a.estado === 'PENDIENTE' || a.estado === 'EN_REVISION'"
                    (click)="abrirModalRechazo(a)"
                    class="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition flex items-center justify-center gap-1 min-w-[95px]"
                  >
                    <span>❌ Rechazar</span>
                  </button>

                  <button
                    *ngIf="a.estado === 'PUBLICADO' || a.estado === 'OBSERVADO'"
                    (click)="suspenderAlojamiento(a.id)"
                    class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1 min-w-[95px]"
                  >
                    <span>⛔ Suspender</span>
                  </button>

                  <button
                    *ngIf="a.modalidad === 'HOTEL_HOSTAL'"
                    (click)="inspeccionarAlojamiento(a, 'habitaciones')"
                    class="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5"
                    title="Ver habitaciones configuradas del hotel"
                  >
                    🏨 Habitaciones ({{ a.unidades?.length || 0 }})
                  </button>

                  <button
                    (click)="inspeccionarAlojamiento(a, 'general')"
                    class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 hover:text-slate-900 dark:text-stone-300 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-stone-700 hover:border-blue-500/40 transition"
                  >
                    Detalles
                  </button>
                </div>

              </div>
            </div>

          </div>

          <!-- ======================================================== -->
          <!-- VISTA 4: LIQUIDACIONES Y DESEMBOLSOS A ANFITRIONES       -->
          <!-- ======================================================== -->
          <div *ngIf="activeTab === 'liquidaciones'" class="space-y-6 animate-fade-in">
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">Gestión de Transferencias y Desembolsos ACH</h3>
                <p class="text-xs text-slate-500 dark:text-stone-400 mt-0.5">Pago de ingresos netos a cuentas bancarias acreditadas en el sistema financiero boliviano</p>
              </div>

              <button
                (click)="autorizarLotePagos()"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:opacity-95 transition flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Autorizar Lote Bancario</span>
              </button>
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
                    <td class="py-3.5 px-5 font-mono text-right text-blue-600 dark:text-blue-400 font-semibold">
                      -{{ l.comisionPlataforma.toFixed(2) }} BOB
                    </td>
                    <td class="py-3.5 px-5 font-mono text-right text-slate-500 dark:text-stone-400">
                      -{{ l.retencionImpuestos.toFixed(2) }} BOB
                    </td>
                    <td class="py-3.5 px-5 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400 text-sm">
                      {{ l.montoNeto.toFixed(2) }} BOB
                    </td>
                    <td class="py-3.5 px-5 text-center">
                      <span [class]="l.estado === 'PAGADO' ? 'px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800' : (l.estado === 'EN_PROCESO' ? 'px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-800' : 'px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800')">
                        {{ l.estado }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- ======================================================== -->
          <!-- VISTA 5: REPORTES GENERATIVOS CON INTELIGENCIA ARTIFICIAL-->
          <!-- ======================================================== -->
          <div *ngIf="activeTab === 'reportes-ia'" class="space-y-6 animate-fade-in">
            
            <!-- Generador de Informes Estratégicos -->
            <div class="p-6 rounded-3xl liquid-card border-blue-500/30 space-y-5">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                      Motor de Analítica Predictiva & Generativa
                    </span>
                  </div>
                  <h3 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">Generador de Informes de Negocio con Inteligencia Artificial</h3>
                  <p class="text-xs text-slate-500 dark:text-stone-400 mt-1">Sintetiza tendencias de ocupación regional, simulación fiscal y proyecciones estratégicas</p>
                </div>

                <button
                  (click)="generarReporteIA()"
                  [disabled]="generandoReporte"
                  class="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition shrink-0"
                >
                  <svg *ngIf="!generandoReporte" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <svg *ngIf="generandoReporte" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>{{ generandoReporte ? 'Procesando Datos y Generando...' : 'Generar Informe Ejecutivo con IA' }}</span>
                </button>
              </div>

              <!-- Selector de Tipo de Reporte -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <button
                  (click)="tipoReporteSeleccionado = 1"
                  [class]="tipoReporteSeleccionado === 1 ? 'p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 text-left space-y-1 shadow-md shadow-blue-500/10 transition' : 'p-4 rounded-2xl bg-slate-50 dark:bg-stone-900/60 border border-slate-200 dark:border-stone-800 text-left space-y-1 hover:border-slate-300 dark:hover:border-stone-700 transition'"
                >
                  <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Auditoría & Proyección</span>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Cierre Fiscal & Rendimiento</h4>
                  <p class="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed">Balance contable, retenciones impositivas y margen neto de comisiones.</p>
                </button>

                <button
                  (click)="tipoReporteSeleccionado = 2"
                  [class]="tipoReporteSeleccionado === 2 ? 'p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 text-left space-y-1 shadow-md shadow-blue-500/10 transition' : 'p-4 rounded-2xl bg-slate-50 dark:bg-stone-900/60 border border-slate-200 dark:border-stone-800 text-left space-y-1 hover:border-slate-300 dark:hover:border-stone-700 transition'"
                >
                  <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Tendencia Regional</span>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Demanda Festividades 2026</h4>
                  <p class="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed">Predicción de ocupación en Chiquitanía, Carnaval de Oruro y Lago Titicaca.</p>
                </button>

                <button
                  (click)="tipoReporteSeleccionado = 3"
                  [class]="tipoReporteSeleccionado === 3 ? 'p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border-2 border-cyan-600 text-left space-y-1 shadow-md shadow-cyan-500/10 transition' : 'p-4 rounded-2xl bg-slate-50 dark:bg-stone-900/60 border border-slate-200 dark:border-stone-800 text-left space-y-1 hover:border-slate-300 dark:hover:border-stone-700 transition'"
                >
                  <span class="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">Calidad & Detección</span>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Detección de Anomalías</h4>
                  <p class="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed">Monitoreo de cancelaciones inusuales y auditoría de precios por noche.</p>
                </button>
              </div>
            </div>

            <!-- Previsualización del Informe Generado -->
            <div *ngIf="reporteActual" class="p-8 rounded-3xl liquid-card border-slate-200 dark:border-stone-800 space-y-8 animate-fade-in shadow-xl">
              
              <!-- Encabezado del Documento -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-stone-800">
                <div>
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                      {{ reporteActual.categoria }}
                    </span>
                    <span class="text-xs text-slate-400 dark:text-stone-500 font-mono">• Emitido: {{ reporteActual.fechaEmision }}</span>
                  </div>
                  <h2 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">{{ reporteActual.titulo }}</h2>
                  <p class="text-xs text-slate-500 dark:text-stone-400 mt-1">Período evaluado: {{ reporteActual.periodo }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    (click)="exportarPdfSimulado()"
                    class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 hover:text-slate-900 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 transition border border-slate-200 dark:border-stone-700"
                  >
                    <svg class="w-4 h-4 text-slate-500 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Descargar PDF</span>
                  </button>

                  <button
                    (click)="exportarExcelSimulado()"
                    class="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>

              <!-- Métricas Clave del Informe -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div *ngFor="let k of reporteActual.kpis" class="p-4 rounded-2xl bg-slate-50 dark:bg-stone-900/80 border border-slate-200 dark:border-stone-800 space-y-1">
                  <span class="text-[11px] text-slate-500 dark:text-stone-400 font-semibold">{{ k.etiqueta }}</span>
                  <div class="text-2xl font-black text-slate-900 dark:text-white font-sans">{{ k.valor }}</div>
                  <div [class]="k.esPositivo ? 'text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-[11px] text-blue-600 dark:text-blue-400 font-semibold'">
                    {{ k.variacion }}
                  </div>
                </div>
              </div>

              <!-- Resumen Ejecutivo -->
              <div class="p-5 rounded-2xl bg-slate-50 dark:bg-stone-900/50 border border-slate-200 dark:border-stone-800/80 space-y-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Resumen Ejecutivo</h4>
                <p class="text-xs leading-relaxed text-slate-700 dark:text-stone-300">
                  {{ reporteActual.resumenEjecutivo }}
                </p>
              </div>

              <!-- Puntos Clave & Hallazgos -->
              <div class="space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Hallazgos Principales</h4>
                <ul class="space-y-2.5 text-xs text-slate-700 dark:text-stone-300">
                  <li *ngFor="let punto of reporteActual.puntosClave" class="flex items-start gap-2.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span class="leading-relaxed">{{ punto }}</span>
                  </li>
                </ul>
              </div>

              <!-- Recomendaciones Estratégicas para la Dirección -->
              <div class="p-5 rounded-2xl bg-blue-50/60 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-carbon-900 border border-blue-200 dark:border-blue-500/30 space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Recomendaciones Estratégicas</h4>
                <ul class="space-y-2 text-xs text-slate-800 dark:text-stone-200">
                  <li *ngFor="let rec of reporteActual.recomendacionesEstrategicas" class="flex items-start gap-2.5">
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                    <span class="leading-relaxed">{{ rec }}</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </main>
      </div>

      <!-- ========================================== -->
      <!-- MODAL DE INSPECCIÓN PANORÁMICA DE ALOJAMIENTO -->
      <!-- ========================================== -->
      <div *ngIf="alojamientoInspeccionado" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div class="absolute inset-0" (click)="cerrarInspeccion()"></div>

        <div class="relative w-full max-w-5xl my-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-stone-800 text-slate-900 dark:text-white z-10 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-modal-in">
          
          <!-- Encabezado con Badges & Título -->
          <div class="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-stone-800/80 pb-4">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                  Auditoría Técnica & Calidad Turística
                </span>
                <span class="text-slate-400 dark:text-stone-600">•</span>
                <span class="text-[10px] font-semibold text-slate-600 dark:text-stone-300">
                  {{ alojamientoInspeccionado.departamento }} • {{ alojamientoInspeccionado.ciudad }}
                </span>
                <span *ngIf="alojamientoInspeccionado.modalidad === 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                  🏨 Hotel / Hostal (Múltiples Hab.)
                </span>
                <span *ngIf="alojamientoInspeccionado.modalidad !== 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  🏡 Oferta Única (Casa / Depto)
                </span>
                <span [class]="alojamientoInspeccionado.estado === 'PUBLICADO' ? 'px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800' : (alojamientoInspeccionado.estado === 'EN_REVISION' ? 'px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800' : 'px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800')">
                  {{ alojamientoInspeccionado.estado === 'PUBLICADO' ? '● Publicado' : (alojamientoInspeccionado.estado === 'EN_REVISION' ? '⏳ Por Revisar' : '✕ Observado') }}
                </span>
              </div>

              <h2 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">{{ alojamientoInspeccionado.titulo }}</h2>
              <p class="text-xs text-slate-500 dark:text-stone-400">
                Anfitrión Responsable: <strong class="text-slate-800 dark:text-stone-200">{{ alojamientoInspeccionado.anfitrion }}</strong> • Dirección: <strong class="text-slate-700 dark:text-stone-300">{{ alojamientoInspeccionado.direccion || 'Zona registrada' }}</strong> • ID: <span class="font-mono text-slate-400 dark:text-stone-500">{{ alojamientoInspeccionado.id }}</span>
              </p>
            </div>

            <button
              (click)="cerrarInspeccion()"
              class="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-800 hover:text-slate-900 dark:text-stone-100 font-bold text-sm transition cursor-pointer border border-slate-300 dark:border-stone-700 flex items-center justify-center shadow-sm"
              title="Cerrar Inspección (Esc)"
            >
              ✕
            </button>
          </div>

          <!-- PESTAÑAS DE INSPECCIÓN PARA HOTELES -->
          <div *ngIf="alojamientoInspeccionado.modalidad === 'HOTEL_HOSTAL'" class="flex items-center gap-2 border-b border-slate-200 dark:border-stone-800 pb-3">
            <button
              type="button"
              (click)="subTabInspeccion = 'general'"
              [class]="subTabInspeccion === 'general' ? 'px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20' : 'px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 font-semibold text-xs transition border border-slate-200 dark:border-stone-700'"
            >
              📋 Ficha General del Hotel
            </button>
            <button
              type="button"
              (click)="subTabInspeccion = 'habitaciones'"
              [class]="subTabInspeccion === 'habitaciones' ? 'px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20' : 'px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 font-semibold text-xs transition border border-slate-200 dark:border-stone-700'"
            >
              🏨 Habitaciones & Unidades ({{ alojamientoInspeccionado.unidades?.length || 0 }})
            </button>
          </div>

          <!-- CONTENIDO TAB HABITACIONES (DESTACADO PARA HOTELES) -->
          <div *ngIf="alojamientoInspeccionado.modalidad === 'HOTEL_HOSTAL' && subTabInspeccion === 'habitaciones'" class="space-y-4 animate-fade-in">
            <div class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 class="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  Gestión y Moderación de Habitaciones del Establecimiento
                </h4>
                <p class="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Puedes desactivar individualmente una habitación por mantenimiento sin suspender todo el hotel.
                </p>
              </div>
              <span class="px-3 py-1 rounded-full bg-white dark:bg-stone-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-sm border border-indigo-200 dark:border-indigo-800 font-mono">
                Total Tipologías: {{ alojamientoInspeccionado.unidades?.length || 0 }}
              </span>
            </div>

            <div *ngIf="!alojamientoInspeccionado.unidades || alojamientoInspeccionado.unidades.length === 0" class="p-8 text-center rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 text-slate-500 dark:text-stone-400 text-xs">
              No hay habitaciones configuradas para este establecimiento.
            </div>

            <div *ngIf="alojamientoInspeccionado.unidades && alojamientoInspeccionado.unidades.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div *ngFor="let u of alojamientoInspeccionado.unidades" class="p-4 rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 space-y-3 shadow-sm hover:border-blue-500/30 transition">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h5 class="text-sm font-bold text-slate-900 dark:text-white">{{ u.nombre }}</h5>
                    <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-stone-400">
                      <span>👥 {{ u.capacidadHuespedes }} pers.</span>
                      <span>•</span>
                      <span>🛏️ {{ u.cantidadCamas }} camas</span>
                      <span>•</span>
                      <span>🚿 {{ u.cantidadBanos }} baños</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm block">{{ u.precioNoche }} BOB</span>
                    <span class="text-[10px] text-slate-400 dark:text-stone-500">por noche</span>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-stone-800 text-[11px] flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 dark:text-stone-400">Inventario: <strong>{{ u.inventarioTotal }} unidades</strong></span>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          [ngClass]="u.estado === 'MANTENIMIENTO' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'">
                      {{ u.estado === 'MANTENIMIENTO' ? 'En Mantenimiento (Oculta)' : 'Disponible' }}
                    </span>
                  </div>
                  <button (click)="alternarEstadoHabitacion(u)"
                          class="px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors shadow-sm cursor-pointer"
                          [ngClass]="u.estado === 'MANTENIMIENTO' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'bg-white dark:bg-stone-800 text-slate-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 border-slate-300 dark:border-stone-700'">
                    {{ u.estado === 'MANTENIMIENTO' ? '✓ Reactivar Habitación' : '✕ Desactivar Habitación' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- CONTENIDO TAB GENERAL (O VISTA ÚNICA PARA CASAS/DEPTOS) -->
          <div *ngIf="alojamientoInspeccionado.modalidad !== 'HOTEL_HOSTAL' || subTabInspeccion === 'general'" class="space-y-6 animate-fade-in">

          <!-- Galería Fotográfica Amplia con Lightbox -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="md:col-span-3 h-72 sm:h-80 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-stone-800 cursor-pointer group" (click)="abrirFotoLightbox(alojamientoInspeccionado.imagen, 0, alojamientoInspeccionado.fotos)">
              <img [src]="alojamientoInspeccionado.imagen" [alt]="alojamientoInspeccionado.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white font-mono font-bold text-xs border border-white/10">
                Tarifa Base: {{ alojamientoInspeccionado.precioNoche }} BOB / noche
              </div>
              <div class="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <span>🔍 Ver en Alta Resolución</span>
              </div>
            </div>
            
            <div class="hidden md:flex flex-col gap-3 h-72 sm:h-80">
              <div *ngFor="let f of (alojamientoInspeccionado.fotos?.slice(1, 4) || []); let i = index" class="flex-1 rounded-xl overflow-hidden relative border border-slate-200 dark:border-stone-800 cursor-pointer group" (click)="abrirFotoLightbox(f, i + 1, alojamientoInspeccionado.fotos)">
                <img [src]="f" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div *ngIf="!alojamientoInspeccionado.fotos || alojamientoInspeccionado.fotos.length <= 1" class="flex-1 rounded-xl bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 flex flex-col items-center justify-center p-3 text-center text-slate-400 dark:text-stone-500 text-[11px]">
                <span>📸 Fotografía principal verificada</span>
              </div>
            </div>
          </div>

          <!-- Tarjetas de Especificaciones Principales -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-950/80 border border-slate-200 dark:border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-stone-400 block tracking-wider">Capacidad Máxima</span>
              <div class="font-bold text-slate-900 dark:text-white text-base">👥 {{ alojamientoInspeccionado.capacidad }} Huéspedes</div>
              <span class="text-[10px] text-slate-400 dark:text-stone-500">Distribución certificada</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-950/80 border border-slate-200 dark:border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-stone-400 block tracking-wider">Dormitorios / Unidades</span>
              <div class="font-bold text-slate-900 dark:text-white text-base">🛏️ {{ alojamientoInspeccionado.habitaciones }} Habitaciones</div>
              <span class="text-[10px] text-slate-400 dark:text-stone-500">{{ alojamientoInspeccionado.unidades?.length || 1 }} unidades registradas</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-950/80 border border-slate-200 dark:border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-stone-400 block tracking-wider">Horario de Ingreso</span>
              <div class="font-bold text-slate-900 dark:text-white text-base">⏰ {{ alojamientoInspeccionado.horarioEntrada || '14:00' }}</div>
              <span class="text-[10px] text-slate-400 dark:text-stone-500">Check-in anfitrión</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-950/80 border border-slate-200 dark:border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-stone-400 block tracking-wider">Horario de Salida</span>
              <div class="font-bold text-slate-900 dark:text-white text-base">⏰ {{ alojamientoInspeccionado.horarioSalida || '11:00' }}</div>
              <span class="text-[10px] text-slate-400 dark:text-stone-500">Check-out límite</span>
            </div>
          </div>

          <!-- Descripción del Alojamiento -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Descripción Comercial & Reglas</h4>
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-stone-950/80 border border-slate-200 dark:border-stone-800 text-xs text-slate-700 dark:text-stone-300 leading-relaxed">
              {{ alojamientoInspeccionado.descripcion }}
            </div>
          </div>

          <!-- Detalle de Habitaciones / Unidades Reservables (Especial Hoteles y Casas) -->
          <div *ngIf="alojamientoInspeccionado.unidades && alojamientoInspeccionado.unidades.length > 0" class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Inventario de Habitaciones & Unidades Reservables ({{ alojamientoInspeccionado.unidades.length }})
              </h4>
              <span class="text-[10px] text-slate-500 dark:text-stone-400">
                Desglose para reservas simultáneas
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div *ngFor="let u of alojamientoInspeccionado.unidades" class="p-4 rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h5 class="text-sm font-bold text-slate-900 dark:text-white">{{ u.nombre }}</h5>
                    <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-stone-400">
                      <span>👥 {{ u.capacidadHuespedes }} pers.</span>
                      <span>•</span>
                      <span>🛏️ {{ u.cantidadCamas }} camas</span>
                      <span>•</span>
                      <span>🚿 {{ u.cantidadBanos }} baños</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm block">{{ u.precioNoche }} BOB</span>
                    <span class="text-[10px] text-slate-400 dark:text-stone-500">por noche</span>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-stone-800 text-[11px] flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 dark:text-stone-400">Stock: {{ u.inventarioTotal }} un.</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          [ngClass]="u.estado === 'MANTENIMIENTO' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'">
                      {{ u.estado === 'MANTENIMIENTO' ? 'En Mantenimiento (Oculta)' : 'Disponible' }}
                    </span>
                  </div>
                  <button (click)="alternarEstadoHabitacion(u)"
                          class="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors shadow-sm"
                          [ngClass]="u.estado === 'MANTENIMIENTO' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 border-slate-300 dark:border-stone-700'">
                    {{ u.estado === 'MANTENIMIENTO' ? '✓ Reactivar Habitación' : '✕ Ocultar Habitación' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Servicios & Amenidades Declaradas -->
          <div *ngIf="alojamientoInspeccionado.servicios && alojamientoInspeccionado.servicios.length > 0" class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">Servicios e Infraestructura</h4>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let s of alojamientoInspeccionado.servicios" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-xs text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <span class="text-blue-600 dark:text-blue-400">✓</span>
                <span>{{ s }}</span>
              </span>
            </div>
          </div>

          <!-- Políticas y Reglas -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 space-y-2 text-xs">
            <div *ngIf="alojamientoInspeccionado.politicas" class="text-slate-700 dark:text-stone-300 text-xs leading-relaxed">
              <strong class="text-slate-900 dark:text-stone-200 block mb-1">Políticas de Convivencia y Cancelación:</strong>
              {{ alojamientoInspeccionado.politicas }}
            </div>
            <div *ngIf="alojamientoInspeccionado.motivoRechazo" class="pt-2 border-t border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
              <strong class="block mb-0.5 text-rose-800 dark:text-rose-200">Observación Anterior Registrada:</strong>
              {{ alojamientoInspeccionado.motivoRechazo }}
            </div>
          </div>
          </div>

          <!-- Footer de Moderación Administrativa -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-stone-800">
            <button
              (click)="cerrarInspeccion()"
              class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 text-xs font-semibold transition border border-slate-200 dark:border-stone-700"
            >
              Cerrar Inspección
            </button>

            <div class="flex items-center gap-2 flex-wrap">
              <button
                *ngIf="alojamientoInspeccionado.estado === 'PENDIENTE'"
                (click)="iniciarRevision(alojamientoInspeccionado.id); cerrarInspeccion()"
                class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <span>🔍 Iniciar Revisión</span>
              </button>

              <button
                *ngIf="alojamientoInspeccionado.estado === 'PENDIENTE' || alojamientoInspeccionado.estado === 'EN_REVISION'"
                (click)="abrirModalObservacion(alojamientoInspeccionado); cerrarInspeccion()"
                class="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-800 transition flex items-center gap-1.5"
              >
                <span>⚠️ Observar</span>
              </button>

              <button
                *ngIf="alojamientoInspeccionado.estado === 'PENDIENTE' || alojamientoInspeccionado.estado === 'EN_REVISION'"
                (click)="abrirModalRechazo(alojamientoInspeccionado); cerrarInspeccion()"
                class="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition flex items-center gap-1.5"
              >
                <span>❌ Rechazar</span>
              </button>

              <button
                *ngIf="alojamientoInspeccionado.estado === 'PUBLICADO' || alojamientoInspeccionado.estado === 'OBSERVADO'"
                (click)="suspenderAlojamiento(alojamientoInspeccionado.id); cerrarInspeccion()"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition"
              >
                <span>⛔ Suspender</span>
              </button>

              <button
                *ngIf="alojamientoInspeccionado.estado !== 'PUBLICADO'"
                (click)="aprobarAlojamiento(alojamientoInspeccionado.id); cerrarInspeccion()"
                class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition flex items-center gap-1.5"
              >
                <span>✓ Aprobar y Publicar en Catálogo</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL DE OBSERVACIÓN / RECHAZO             -->
      <!-- ========================================== -->
      <div *ngIf="modalRechazoAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
        <div class="absolute inset-0" (click)="modalRechazoAbierto = false"></div>

        <div class="relative w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-carbon-900 border border-slate-200 dark:border-stone-700 text-slate-900 dark:text-white z-10 space-y-4 shadow-2xl animate-modal-in">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block mb-0.5">
                Moderación de Calidad
              </span>
              <h3 class="font-serif text-lg font-bold text-slate-900 dark:text-white">Observar Solicitud de Alojamiento</h3>
              <p class="text-xs text-slate-500 dark:text-stone-400">{{ alojamientoParaRechazo?.titulo }}</p>
            </div>
            <button (click)="modalRechazoAbierto = false" class="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white transition">✕</button>
          </div>

          <p class="text-xs text-slate-600 dark:text-stone-300 leading-relaxed">
            Especifique el motivo técnico o administrativo de la observación. El anfitrión recibirá esta notificación para corregir su solicitud y volver a postularla.
          </p>

          <div>
            <label class="block text-[11px] font-semibold text-slate-600 dark:text-stone-400 mb-1">Motivo de la Observación:</label>
            <textarea
              [(ngModel)]="motivoRechazoTexto"
              rows="4"
              class="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-300 dark:border-stone-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500 transition"
              placeholder="Indique las observaciones sobre fotografías, normas de habitabilidad o licencias..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-stone-800">
            <button
              (click)="modalRechazoAbierto = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 hover:text-slate-900 dark:text-stone-300 text-xs font-semibold transition border border-slate-200 dark:border-stone-700"
            >
              Cancelar
            </button>
            <button
              (click)="confirmarRechazo()"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition"
            >
              Confirmar Observación
            </button>
          </div>
        </div>
      </div>

      <!-- LIGHTBOX DE FOTOGRAFÍAS A PANTALLA COMPLETA CON CONTROL DE TECLADO Y MODO CLARO/OSCURO -->
      <div *ngIf="fotoLightboxUrl" class="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-slate-950/95 backdrop-blur-2xl animate-fade-in text-white select-none" (click)="cerrarFotoLightbox()">
        
        <!-- Header Superior del Lightbox -->
        <div class="flex items-center justify-between z-20 w-full max-w-6xl mx-auto px-5 py-3 rounded-2xl bg-white/10 dark:bg-stone-900/80 backdrop-blur-md border border-white/15 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span class="text-sm sm:text-base font-bold text-white block leading-tight">
                {{ alojamientoInspeccionado?.titulo || 'Fotografía de Inspección Técnica' }}
              </span>
              <div class="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span class="font-mono">Foto {{ fotoLightboxIndex + 1 }} de {{ fotosLightboxLista.length }}</span>
                <span>•</span>
                <span class="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white">[← / → Flechas]</span>
                <span class="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white">[Esc Salir]</span>
              </div>
            </div>
          </div>

          <button
            (click)="cerrarFotoLightbox()"
            class="px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition border border-white/25 flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
            title="Cerrar vista (Esc)"
          >
            <span class="text-sm font-black">✕</span>
            <span>Cerrar (Esc)</span>
          </button>
        </div>

        <!-- Área Central con Imagen y Flechas Flotantes -->
        <div class="relative flex-1 flex items-center justify-center max-w-6xl w-full mx-auto my-3" (click)="$event.stopPropagation()">
          <!-- Flecha Anterior -->
          <button
            *ngIf="fotosLightboxLista.length > 1"
            (click)="fotoAnterior(); $event.stopPropagation()"
            class="absolute left-2 sm:left-4 z-20 p-3.5 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600 text-white transition backdrop-blur-md border border-white/20 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
            title="Foto anterior (←)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Imagen Principal -->
          <img
            [src]="fotoLightboxUrl"
            class="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-white/20 select-none animate-fade-in"
          />

          <!-- Flecha Siguiente -->
          <button
            *ngIf="fotosLightboxLista.length > 1"
            (click)="fotoSiguiente(); $event.stopPropagation()"
            class="absolute right-2 sm:right-4 z-20 p-3.5 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600 text-white transition backdrop-blur-md border border-white/20 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
            title="Foto siguiente (→)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Tira de Miniaturas Inferior -->
        <div *ngIf="fotosLightboxLista.length > 1" class="flex items-center justify-center gap-2 z-20 max-w-5xl mx-auto overflow-x-auto py-2.5 px-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md" (click)="$event.stopPropagation()">
          <button
            *ngFor="let f of fotosLightboxLista; let i = index"
            (click)="abrirFotoLightbox(f, i, fotosLightboxLista); $event.stopPropagation()"
            [class]="i === fotoLightboxIndex ? 'w-14 h-14 rounded-xl overflow-hidden ring-2 ring-blue-500 shrink-0 shadow-lg scale-105 transition-all' : 'w-14 h-14 rounded-xl overflow-hidden opacity-50 hover:opacity-100 shrink-0 transition-all border border-white/20'"
          >
            <img [src]="f" class="w-full h-full object-cover" />
          </button>
        </div>

      </div>

    </div>
  `
})
export class AppComponent implements OnInit {
  activeTab: 'dashboard' | 'contabilidad' | 'alojamientos' | 'liquidaciones' | 'reportes-ia' = 'dashboard';
  idPendienteInspeccion: string | null = null;
  isDarkMode: boolean = true;
  
  // Contabilidad State
  movimientos: MovimientoContable[] = [];
  filtroTipo: 'TODOS' | 'DEBITO' | 'CREDITO' = 'TODOS';
  busquedaContable: string = '';

  // Alojamientos State
  alojamientoInspeccionado: SolicitudAlojamiento | null = null;
  subTabInspeccion: 'general' | 'habitaciones' = 'general';
  filtroAlojamientos: 'TODOS' | 'PENDIENTE' | 'PENDIENTES' | 'EN_REVISION' | 'PUBLICADO' | 'PUBLICADOS' | 'OBSERVADO' | 'OBSERVADOS' | 'SUSPENDIDO' | 'SUSPENDIDOS' | 'RECHAZADO' | 'RECHAZADOS' = 'TODOS';
  modalRechazoAbierto: boolean = false;
  alojamientoParaRechazo: SolicitudAlojamiento | null = null;
  motivoRechazoTexto: string = '';
  fotoLightboxUrl: string | null = null;
  fotoLightboxIndex: number = 0;
  fotosLightboxLista: string[] = [];
  cargandoAlojamientos: boolean = false;
  alojamientos: SolicitudAlojamiento[] = [];

  // Liquidaciones State
  liquidaciones: LiquidacionAnfitrion[] = [
    {
      id: 'LIQ-2026-001',
      anfitrion: 'Carlos Mendoza Cuéllar',
      alojamiento: 'Cabaña Chiquitana El Palmar',
      banco: 'Banco Nacional de Bolivia (BNB)',
      numeroCuenta: '2000-1928371-01',
      montoBruto: 1950.00,
      comisionPlataforma: 195.00,
      retencionImpuestos: 0.00,
      montoNeto: 1755.00,
      estado: 'PENDIENTE',
      fechaLiquidacion: '2026-10-29'
    },
    {
      id: 'LIQ-2026-002',
      anfitrion: 'Mauricio Farfán Trigo',
      alojamiento: 'Casa Colonial San Blas',
      banco: 'Banco Mercantil Santa Cruz',
      numeroCuenta: '4010-3849102-12',
      montoBruto: 2600.00,
      comisionPlataforma: 260.00,
      retencionImpuestos: 0.00,
      montoNeto: 2340.00,
      estado: 'PAGADO',
      fechaLiquidacion: '2026-10-26'
    },
    {
      id: 'LIQ-2026-003',
      anfitrion: 'Beatriz Quispe Mamani',
      alojamiento: 'Hostal Mirador Titicaca (Copacabana)',
      banco: 'Banco Unión',
      numeroCuenta: '1000-5928172-83',
      montoBruto: 1350.00,
      comisionPlataforma: 135.00,
      retencionImpuestos: 0.00,
      montoNeto: 1215.00,
      estado: 'PAGADO',
      fechaLiquidacion: '2026-10-24'
    }
  ];

  // Reportes IA State
  tipoReporteSeleccionado: number = 1;
  generandoReporte: boolean = false;
  reporteActual: ReporteGenerativo | null = null;

  ngOnInit() {
    // 1. Inicializar Tema persistente desde LocalStorage
    try {
      const savedTheme = localStorage.getItem('alojate_theme_mode');
      this.isDarkMode = savedTheme !== 'light';
    } catch {
      this.isDarkMode = true;
    }
    this.aplicarTema();

    // 2. Cache local de alojamientos
    try {
      const cached = localStorage.getItem('alojate_admin_alojamientos');
      if (cached) {
        this.alojamientos = JSON.parse(cached);
      }
    } catch {}

    // 3. Sincronización de Rutas Hash (Persistencia al recargar con F5)
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.sincronizarRuta());
      this.sincronizarRuta();
    }

    this.cargarMovimientos();
    this.cargarAlojamientos();
    this.generarReporteIA();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    try {
      localStorage.setItem('alojate_theme_mode', this.isDarkMode ? 'dark' : 'light');
    } catch {}
    this.aplicarTema();
  }

  aplicarTema() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('theme-light', !this.isDarkMode);
      if (this.isDarkMode) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }

  cambiarTab(tab: 'dashboard' | 'contabilidad' | 'alojamientos' | 'liquidaciones' | 'reportes-ia') {
    this.activeTab = tab;
    if (tab === 'alojamientos' && !this.alojamientoInspeccionado) {
      window.location.hash = '#/alojamientos';
    } else if (tab === 'alojamientos' && this.alojamientoInspeccionado) {
      window.location.hash = `#/alojamientos/${this.alojamientoInspeccionado.id}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
    try {
      localStorage.setItem('alojate_admin_tab', tab);
    } catch {}
  }

  inspeccionarAlojamiento(a: SolicitudAlojamiento, subTab: 'general' | 'habitaciones' = 'general') {
    this.alojamientoInspeccionado = a;
    this.subTabInspeccion = subTab;
    this.activeTab = 'alojamientos';
    window.location.hash = `#/alojamientos/${a.id}`;
  }

  cerrarInspeccion() {
    this.alojamientoInspeccionado = null;
    window.location.hash = '#/alojamientos';
  }

  sincronizarRuta() {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#\/?!?\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    const rutaBase = parts[0];

    if (rutaBase === 'dashboard' || rutaBase === 'contabilidad' || rutaBase === 'liquidaciones' || rutaBase === 'reportes-ia') {
      this.activeTab = rutaBase as any;
      this.alojamientoInspeccionado = null;
      try {
        localStorage.setItem('alojate_admin_tab', rutaBase);
      } catch {}
    } else if (rutaBase === 'alojamientos') {
      this.activeTab = 'alojamientos';
      try {
        localStorage.setItem('alojate_admin_tab', 'alojamientos');
      } catch {}
      const alojId = parts[1];
      if (alojId) {
        const item = this.alojamientos.find(a => a.id === alojId);
        if (item) {
          this.alojamientoInspeccionado = item;
        } else {
          this.idPendienteInspeccion = alojId;
        }
      } else {
        this.alojamientoInspeccionado = null;
      }
    } else {
      try {
        const savedTab = localStorage.getItem('alojate_admin_tab') as any;
        if (savedTab && ['dashboard', 'contabilidad', 'alojamientos', 'liquidaciones', 'reportes-ia'].includes(savedTab)) {
          this.activeTab = savedTab;
        } else {
          this.activeTab = 'dashboard';
        }
      } catch {
        this.activeTab = 'dashboard';
      }
    }
  }

  obtenerTituloVista(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Panel de Control Ejecutivo';
      case 'contabilidad': return 'Registro de Transacciones & Liquidaciones';
      case 'alojamientos': return 'Verificación de Propiedades y Calidad';
      case 'liquidaciones': return 'Liquidaciones y Desembolsos a Anfitriones';
      case 'reportes-ia': return 'Analítica Estratégica & Reportes Inteligentes';
    }
  }

  obtenerSubtituloVista(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Métricas consolidadas de transacciones, liquidaciones y demanda turística nacional';
      case 'contabilidad': return 'Auditoría de cobros QR Simple BNB, comisiones del 10% y transferencias bancarias';
      case 'alojamientos': return 'Inspección de estándares de habitabilidad y aprobación de anfitriones bolivianos';
      case 'liquidaciones': return 'Desembolsos periódicos a cuentas bancarias acreditadas en el sistema financiero';
      case 'reportes-ia': return 'Modelos predictivos de demanda, recomendaciones ejecutivas y proyecciones fiscales';
    }
  }

  async cargarMovimientos() {
    try {
      const res = await fetch('http://localhost:8080/api/v1/finanzas/contabilidad');
      if (res.ok) {
        this.movimientos = await res.json();
      } else {
        this.cargarFallback();
      }
    } catch {
      this.cargarFallback();
    }
  }

  cargarFallback() {
    this.movimientos = [
      { movimientoId: 1, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Recaudación por Reserva QR BNB (Banco BNB)', tipo: 'DEBITO', monto: 1842.75, origenTipo: 'COBRO_QR_BNB', createdAt: new Date().toISOString() },
      { movimientoId: 2, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Liquidación Neta a Anfitrión (Transferencia ACH)', tipo: 'CREDITO', monto: 1579.50, origenTipo: 'LIQUIDACION_NETA', createdAt: new Date().toISOString() },
      { movimientoId: 3, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Comisión de Plataforma Aloja-Te (10%)', tipo: 'CREDITO', monto: 175.50, origenTipo: 'COMISION_ALOJATE', createdAt: new Date().toISOString() },
      { movimientoId: 4, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Cargo por Servicio y Conectividad (5%)', tipo: 'CREDITO', monto: 87.75, origenTipo: 'CARGO_SERVICIO', createdAt: new Date().toISOString() }
    ];
  }

  movimientosFiltrados(): MovimientoContable[] {
    return this.movimientos.filter(m => {
      const coincideTipo = this.filtroTipo === 'TODOS' || m.tipo === this.filtroTipo;
      const coincideBusqueda = !this.busquedaContable || 
        m.cuenta.toLowerCase().includes(this.busquedaContable.toLowerCase()) ||
        m.asientoId.toLowerCase().includes(this.busquedaContable.toLowerCase());
      return coincideTipo && coincideBusqueda;
    });
  }

  calcularTotalDebito(): number {
    return this.movimientos
      .filter(m => m.tipo === 'DEBITO')
      .reduce((acc, curr) => acc + curr.monto, 0);
  }

  calcularTotalCredito(): number {
    return this.movimientos
      .filter(m => m.tipo === 'CREDITO')
      .reduce((acc, curr) => acc + curr.monto, 0);
  }

  async cargarAlojamientos() {
    this.cargandoAlojamientos = true;
    try {
      let rawData: any[] = [];
      try {
        const resTodos = await fetch('http://localhost:8080/api/v1/alojamientos/todos');
        if (resTodos.ok) {
          rawData = await resTodos.json();
        }
      } catch (e) {
        console.warn('MS-01 todos no disponible, intentando rutas específicas', e);
      }

      if (rawData.length === 0) {
        let pendientesData: any[] = [];
        try {
          const resPendientes = await fetch('http://localhost:8080/api/v1/alojamientos/moderacion/pendientes');
          if (resPendientes.ok) pendientesData = await resPendientes.json();
        } catch {}

        let publicadosData: any[] = [];
        try {
          const resPublicados = await fetch('http://localhost:8080/api/v1/alojamientos');
          if (resPublicados.ok) publicadosData = await resPublicados.json();
        } catch {}

        rawData = [...pendientesData, ...publicadosData];
      }

      const mapAlojamiento = (raw: any): SolicitudAlojamiento => {
        const u = raw.unidades?.[0];
        const fotosList: string[] = (raw.fotografias || []).map((f: any) => f.url || f).filter(Boolean);
        const foto = fotosList[0] || raw.imagen || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';
        if (fotosList.length === 0) fotosList.push(foto);
        return {
          id: raw.idAlojamiento || String(Math.random()),
          titulo: raw.titulo || 'Alojamiento Tradicional',
          anfitrion: raw.nombreAnfitrion || 'Carlos Mendoza · Anfitrión Registrado',
          departamento: raw.departamento || 'Santa Cruz',
          ciudad: raw.ciudad || 'Bolivia',
          direccion: raw.direccion || '',
          tipoPropiedad: raw.tipoPropiedadNombre || 'Hospedaje Tradicional',
          modalidad: raw.modalidad || 'CASA_DEPARTAMENTO',
          precioNoche: Number(u?.precioNoche ?? 500),
          capacidad: Number(u?.capacidadHuespedes ?? 4),
          habitaciones: Number(u?.cantidadDormitorios ?? 2),
          estado: (raw.estadoPublicacion as any) || 'PENDIENTE',
          fechaRegistro: raw.fechaCreacion || new Date().toISOString(),
          imagen: foto,
          fotos: fotosList,
          descripcion: raw.descripcion || '',
          politicas: raw.politicas || 'Ambiente respetuoso y cumplimiento de horarios de ingreso.',
          horarioEntrada: raw.horarioEntrada || '14:00',
          horarioSalida: raw.horarioSalida || '11:00',
          motivoRechazo: raw.motivoObservacionRechazo || raw.motivoRechazo || '',
          motivoObservacionRechazo: raw.motivoObservacionRechazo || raw.motivoRechazo || '',
          origenUltimoCambio: raw.origenUltimoCambio || '',
          unidades: (raw.unidades || []).map((un: any) => ({
            idUnidad: un.idUnidad,
            nombre: un.nombre,
            capacidadHuespedes: un.capacidadHuespedes ?? 2,
            cantidadCamas: un.cantidadCamas ?? 1,
            cantidadBanos: un.cantidadBanos ?? 1,
            inventarioTotal: un.inventarioTotal ?? 1,
            precioNoche: Number(un.precioNoche ?? 0),
            estado: un.estado || 'DISPONIBLE'
          })),
          servicios: (raw.servicios || []).length > 0
            ? (raw.servicios || []).map((s: any) => s.nombre || s)
            : ['WiFi de Alta Velocidad', 'Parqueo Privado Gratuito', 'Ambiente Climatizado', 'Agua Caliente 24/7']
        };
      };

      if (rawData.length > 0) {
        const uniqueMap = new Map<string, SolicitudAlojamiento>();
        for (const item of rawData.map(mapAlojamiento)) {
          uniqueMap.set(item.id, item);
        }
        this.alojamientos = Array.from(uniqueMap.values());
        try {
          localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(this.alojamientos));
        } catch {}
      } else {
        this.cargarAlojamientosFallback();
      }

      if (this.idPendienteInspeccion) {
        const item = this.alojamientos.find(a => a.id === this.idPendienteInspeccion);
        if (item) {
          this.alojamientoInspeccionado = item;
        }
        this.idPendienteInspeccion = null;
      }
    } catch {
      this.cargarAlojamientosFallback();
      if (this.idPendienteInspeccion) {
        const item = this.alojamientos.find(a => a.id === this.idPendienteInspeccion);
        if (item) {
          this.alojamientoInspeccionado = item;
        }
        this.idPendienteInspeccion = null;
      }
    } finally {
      this.cargandoAlojamientos = false;
    }
  }

  cargarAlojamientosFallback() {
    this.alojamientos = [
      {
        id: '045579cf-cc3b-4893-920f-f32246153025',
        titulo: 'Casa de Campo La Rinconada — Valles Cruceños',
        anfitrion: 'Carlos Mendoza (Anfitrión Verificado)',
        departamento: 'Santa Cruz',
        ciudad: 'Samaipata',
        direccion: 'Km 12 Camino a La Pajcha',
        tipoPropiedad: 'Casa de Campo',
        modalidad: 'CASA_DEPARTAMENTO',
        precioNoche: 520.00,
        capacidad: 6,
        habitaciones: 2,
        estado: 'PUBLICADO',
        fechaRegistro: '2026-10-28',
        imagen: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        fotos: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        descripcion: 'Casa campestre con huerto orgánico, vista panorámica a las colinas de Samaipata y fogatero exterior.',
        politicas: 'Ambiente familiar y ecoturismo. Check-in 13:00.',
        horarioEntrada: '13:00',
        horarioSalida: '11:00',
        servicios: ['WiFi de Alta Velocidad', 'Fogata Exterior', 'Huerto Orgánico', 'Estacionamiento Gratuito', 'Parrilla'],
        unidades: [
          { idUnidad: '351b4c06-6bdf-4dc6-9d3b-0d4221123600', nombre: 'Casa de Campo Completa con Fogata', capacidadHuespedes: 6, cantidadCamas: 4, cantidadBanos: 2, inventarioTotal: 1, precioNoche: 520, estado: 'DISPONIBLE' }
        ]
      },
      {
        id: '93fce18e-32fa-400c-8f49-8d4f2fe2f5bb',
        titulo: 'Cabaña Chiquitana El Palmar — Chiquitanía Mágica',
        anfitrion: 'Carlos Mendoza Cuéllar',
        departamento: 'Santa Cruz',
        ciudad: 'San José de Chiquitos',
        direccion: 'Camino a San José Km 5',
        tipoPropiedad: 'Cabaña Chiquitana',
        modalidad: 'CASA_DEPARTAMENTO',
        precioNoche: 650.00,
        capacidad: 8,
        habitaciones: 3,
        estado: 'PUBLICADO',
        fechaRegistro: '2026-10-25',
        imagen: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        fotos: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        descripcion: 'Hermosa cabaña rústica colonial con piscina privada, galería con hamacas y cielo estrellado en el corazón de la Chiquitanía boliviana.',
        politicas: 'Prohibido fumar en interiores. Check-in 14:00 - Check-out 11:00.',
        horarioEntrada: '14:00',
        horarioSalida: '11:00',
        servicios: ['Piscina Privada', 'Galería con Hamacas', 'WiFi Satelital', 'Cocina Completa', 'Desayuno Típico'],
        unidades: [
          { idUnidad: 'u-palmar-1', nombre: 'Cabaña Completa (Master Suite + 2 Dormitorios)', capacidadHuespedes: 8, cantidadCamas: 5, cantidadBanos: 2.5, inventarioTotal: 1, precioNoche: 650, estado: 'DISPONIBLE' }
        ]
      },
      {
        id: '49768530-76ae-459e-9bbe-faf2f3d488ba',
        titulo: 'Hotel Boutique Los Tajibos Colonial',
        anfitrion: 'Valeria Justiniano Aguilera',
        departamento: 'Santa Cruz',
        ciudad: 'Santa Cruz de la Sierra',
        direccion: 'Av. San Martín #120, Barrio Equipetrol',
        tipoPropiedad: 'Hotel Boutique',
        modalidad: 'HOTEL_HOSTAL',
        precioNoche: 480.00,
        capacidad: 2,
        habitaciones: 1,
        estado: 'PUBLICADO',
        fechaRegistro: '2026-10-22',
        imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        fotos: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
        ],
        descripcion: 'Exclusivo hotel boutique con arquitectura chiquitana, restaurante gourmet, spa y áreas verdes tropicales.',
        politicas: 'Recepción 24 horas. Desayuno buffet incluido de 07:00 a 10:30.',
        horarioEntrada: '15:00',
        horarioSalida: '12:00',
        servicios: ['Desayuno Buffet', 'Piscina Tropical', 'Spa & Masajes', 'Recepción 24h', 'Room Service'],
        unidades: [
          { idUnidad: 'u-tajibos-1', nombre: 'Suite Presidencial con Balcón & Vista a Jardines', capacidadHuespedes: 2, cantidadCamas: 1, cantidadBanos: 1.5, inventarioTotal: 3, precioNoche: 950, estado: 'DISPONIBLE' },
          { idUnidad: 'u-tajibos-2', nombre: 'Habitación Ejecutiva Doble Twin', capacidadHuespedes: 2, cantidadCamas: 2, cantidadBanos: 1, inventarioTotal: 12, precioNoche: 480, estado: 'DISPONIBLE' }
        ]
      }
    ];
  }

  alojamientosFiltrados(): SolicitudAlojamiento[] {
    return this.alojamientos.filter(a => {
      if (this.filtroAlojamientos === 'PENDIENTE' || this.filtroAlojamientos === 'PENDIENTES') return a.estado === 'PENDIENTE';
      if (this.filtroAlojamientos === 'EN_REVISION') return a.estado === 'EN_REVISION';
      if (this.filtroAlojamientos === 'PUBLICADO' || this.filtroAlojamientos === 'PUBLICADOS') return a.estado === 'PUBLICADO';
      if (this.filtroAlojamientos === 'OBSERVADO' || this.filtroAlojamientos === 'OBSERVADOS') return a.estado === 'OBSERVADO';
      if (this.filtroAlojamientos === 'SUSPENDIDO' || this.filtroAlojamientos === 'SUSPENDIDOS') return a.estado === 'SUSPENDIDO';
      if (this.filtroAlojamientos === 'RECHAZADO' || this.filtroAlojamientos === 'RECHAZADOS') return a.estado === 'RECHAZADO';
      return true;
    });
  }

  conteoPendientes(): number {
    return this.alojamientos.filter(a => a.estado === 'PENDIENTE').length;
  }

  conteoEnRevision(): number {
    return this.alojamientos.filter(a => a.estado === 'EN_REVISION').length;
  }

  conteoPublicados(): number {
    return this.alojamientos.filter(a => a.estado === 'PUBLICADO').length;
  }

  conteoObservados(): number {
    return this.alojamientos.filter(a => a.estado === 'OBSERVADO').length;
  }

  conteoSuspendidos(): number {
    return this.alojamientos.filter(a => a.estado === 'SUSPENDIDO').length;
  }

  conteoRechazados(): number {
    return this.alojamientos.filter(a => a.estado === 'RECHAZADO').length;
  }

  async iniciarRevision(id: string) {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/estado?estado=EN_REVISION&origen=ADMIN_MANUAL`, {
        method: 'PATCH'
      });
      const item = this.alojamientos.find(a => a.id === id);
      if (item) item.estado = 'EN_REVISION';
      if (res.ok) {
        await this.cargarAlojamientos();
      }
    } catch {
      const item = this.alojamientos.find(a => a.id === id);
      if (item) item.estado = 'EN_REVISION';
    }
  }

  abrirModalObservacion(a: SolicitudAlojamiento) {
    const motivo = prompt('Ingrese el motivo de observación para este alojamiento:', 'Las fotografías requieren revisión adicional de resolución o contenido.');
    if (!motivo) return;
    this.confirmarObservacionDirecta(a.id, motivo);
  }

  async confirmarObservacionDirecta(id: string, motivo: string) {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/observar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo, origen: 'ADMIN_MANUAL' })
      });
      const item = this.alojamientos.find(a => a.id === id);
      if (item) {
        item.estado = 'OBSERVADO';
        item.motivoRechazo = motivo;
      }
      if (res.ok) {
        alert('Alojamiento marcado como OBSERVADO exitosamente.');
        await this.cargarAlojamientos();
      }
    } catch {
      const item = this.alojamientos.find(a => a.id === id);
      if (item) {
        item.estado = 'OBSERVADO';
        item.motivoRechazo = motivo;
      }
      alert('Observación registrada localmente.');
    }
  }

  async aprobarAlojamiento(id: string) {
    const item = this.alojamientos.find(a => a.id === id);
    if (item) {
      item.estado = 'PUBLICADO';
      item.motivoRechazo = undefined;
      if (item.unidades) {
        item.unidades.forEach(u => u.estado = 'DISPONIBLE');
      }
      try {
        localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(this.alojamientos));
      } catch {}
    }

    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/aceptar`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Alojamiento aprobado y publicado exitosamente en el catálogo nacional.');
        await this.cargarAlojamientos();
      } else {
        alert('Estado actualizado a Publicado.');
      }
    } catch {
      alert('Alojamiento publicado exitosamente.');
    }
  }

  abrirModalRechazo(a: SolicitudAlojamiento) {
    this.alojamientoParaRechazo = a;
    this.motivoRechazoTexto = 'Las fotografías no cumplen con la resolución mínima requerida o falta documentación de licencia turística municipal.';
    this.modalRechazoAbierto = true;
  }

  async confirmarRechazo() {
    if (!this.alojamientoParaRechazo) return;
    const item = this.alojamientoParaRechazo;
    const targetId = item.id;
    const motivo = this.motivoRechazoTexto;

    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${targetId}/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
      });
      item.estado = 'RECHAZADO';
      item.motivoRechazo = motivo;
      this.modalRechazoAbierto = false;
      this.alojamientoParaRechazo = null;
      if (res.ok) {
        alert('Solicitud observada/rechazada y notificada al anfitrión.');
        await this.cargarAlojamientos();
      } else {
        alert('Observación registrada localmente.');
      }
    } catch {
      item.estado = 'RECHAZADO';
      item.motivoRechazo = motivo;
      this.modalRechazoAbierto = false;
      this.alojamientoParaRechazo = null;
      alert('Observación guardada.');
    }
  }

  async suspenderAlojamiento(id: string) {
    if (!confirm('¿Está seguro de suspender temporalmente este alojamiento del catálogo público?')) return;
    const motivo = 'Suspensión preventiva por auditoría de calidad.';
    const item = this.alojamientos.find(a => a.id === id);
    if (item) {
      item.estado = 'SUSPENDIDO';
      item.motivoRechazo = motivo;
      if (item.unidades) {
        item.unidades.forEach(u => u.estado = 'MANTENIMIENTO');
      }
      try {
        localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(this.alojamientos));
      } catch {}
    }

    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/suspender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo, origen: 'ADMIN_MANUAL' })
      });
      if (res.ok) {
        alert('Alojamiento suspendido preventivamente en el sistema nacional.');
        await this.cargarAlojamientos();
      } else {
        alert('Alojamiento suspendido preventivamente.');
      }
    } catch {
      alert('Alojamiento suspendido preventivamente (actualizado localmente).');
    }
  }

  @HostListener('window:keydown', ['$event'])
  manejarTecladoLightbox(event: KeyboardEvent) {
    if (!this.fotoLightboxUrl) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.fotoSiguiente();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.fotoAnterior();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cerrarFotoLightbox();
    }
  }

  abrirFotoLightbox(url: string, index: number = 0, fotos?: string[]) {
    this.fotosLightboxLista = (fotos && fotos.length > 0)
      ? fotos
      : (this.alojamientoInspeccionado?.fotos || [url]);
    
    let targetIndex = index;
    if (targetIndex < 0 || targetIndex >= this.fotosLightboxLista.length) {
      const idxFound = this.fotosLightboxLista.indexOf(url);
      targetIndex = idxFound >= 0 ? idxFound : 0;
    }
    this.fotoLightboxIndex = targetIndex;
    this.fotoLightboxUrl = this.fotosLightboxLista[this.fotoLightboxIndex] || url;
  }

  fotoSiguiente() {
    if (this.fotosLightboxLista.length <= 1) return;
    this.fotoLightboxIndex = (this.fotoLightboxIndex + 1) % this.fotosLightboxLista.length;
    this.fotoLightboxUrl = this.fotosLightboxLista[this.fotoLightboxIndex];
  }

  fotoAnterior() {
    if (this.fotosLightboxLista.length <= 1) return;
    this.fotoLightboxIndex = (this.fotoLightboxIndex - 1 + this.fotosLightboxLista.length) % this.fotosLightboxLista.length;
    this.fotoLightboxUrl = this.fotosLightboxLista[this.fotoLightboxIndex];
  }

  cerrarFotoLightbox() {
    this.fotoLightboxUrl = null;
    this.fotosLightboxLista = [];
    this.fotoLightboxIndex = 0;
  }

  async alternarEstadoHabitacion(u: UnidadAdmin) {
    const nuevoEstado = u.estado === 'MANTENIMIENTO' ? 'DISPONIBLE' : 'MANTENIMIENTO';
    try {
      const res = await fetch(`http://localhost:8080/api/v1/unidades/${u.idUnidad}/estado?estado=${nuevoEstado}`, {
        method: 'PATCH'
      });
      u.estado = nuevoEstado;
      alert(`Habitación "${u.nombre}" actualizada a ${nuevoEstado === 'DISPONIBLE' ? 'Disponible' : 'En Mantenimiento (Oculta)'}.`);
    } catch {
      u.estado = nuevoEstado;
      alert(`Estado de la habitación "${u.nombre}" actualizado a ${nuevoEstado === 'DISPONIBLE' ? 'Disponible' : 'En Mantenimiento'}.`);
    }
  }

  async ocultarAlojamiento(id: string) {
    if (!confirm('¿Desea ocultar/pausar temporalmente este alojamiento del catálogo? Sus habitaciones asociadas se desactivarán en cascada.')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/estado?estado=SUSPENDIDO`, {
        method: 'PATCH'
      });
      const item = this.alojamientos.find(a => a.id === id);
      if (item) {
        item.estado = 'SUSPENDIDO';
        if (item.unidades) {
          item.unidades.forEach(u => u.estado = 'MANTENIMIENTO');
        }
      }
      alert('Alojamiento suspendido del catálogo y sus habitaciones han sido desactivadas en cascada.');
      await this.cargarAlojamientos();
    } catch {
      const item = this.alojamientos.find(a => a.id === id);
      if (item) {
        item.estado = 'SUSPENDIDO';
        if (item.unidades) {
          item.unidades.forEach(u => u.estado = 'MANTENIMIENTO');
        }
      }
    }
  }

  autorizarLotePagos() {
    this.liquidaciones.forEach(l => {
      if (l.estado === 'PENDIENTE') {
        l.estado = 'EN_PROCESO';
      }
    });
    alert('Lote de transferencias ACH autorizado exitosamente para procesamiento bancario con Banco BNB.');
  }

  generarReporteIA() {
    this.generandoReporte = true;
    setTimeout(() => {
      this.generandoReporte = false;
      if (this.tipoReporteSeleccionado === 1) {
        this.reporteActual = {
          titulo: 'Informe Ejecutivo de Cierre Fiscal & Rentabilidad Operativa',
          categoria: 'Finanzas & Cumplimiento',
          periodo: 'Octubre 2026 (Mensual Consolidado)',
          fechaEmision: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
          resumenEjecutivo: 'El presente informe consolida un incremento del 14.2% en el volumen transaccional nacional impulsado por la adopción de pagos inmediatos con QR Simple BNB. El margen de comisiones brutas alcanzó 18,425.00 BOB con una retención efectiva del 100% de la partida doble y un cumplimiento del 98.4% en los desembolsos netos hacia cuentas bancarias de los anfitriones.',
          kpis: [
            { etiqueta: 'Volumen Bruto Facturado', valor: '184,250 BOB', variacion: '+14.2% vs sep', esPositivo: true },
            { etiqueta: 'Comisiones Netas Aloja-Te', valor: '18,425 BOB', variacion: '+12.8% margen', esPositivo: true },
            { etiqueta: 'Tasa de Cancelación', valor: '2.1%', variacion: '-0.8% mejora', esPositivo: true }
          ],
          puntosClave: [
            'El 82% de las transacciones se liquidaron exitosamente mediante código QR Simple sin fricción bancaria.',
            'La Chiquitanía y Samaipata representaron el 42% del total de los ingresos percibidos en Santa Cruz.',
            'Todas las facturas electrónicas emitidas cuentan con el Código Único de Facturación (CUF) del SIN verificado.',
            'Cero discrepancias contables registradas: Total Debe (1,842.75 BOB) cuadra perfectamente con Total Haber.'
          ],
          recomendacionesEstrategicas: [
            'Aperturar incentivos de menor comisión (8%) para anfitriones que publiquen propiedades en rutas no tradicionales como Toro Toro y Parque Madidi.',
            'Implementar conciliación horaria automatizada con Banco BNB para reducir el tiempo de compensación ACH a menos de 2 horas.',
            'Preparar el fondo de liquidez preventiva para las liquidaciones del fin de semana largo de Todos Santos.'
          ]
        };
      } else if (this.tipoReporteSeleccionado === 2) {
        this.reporteActual = {
          titulo: 'Análisis Predictivo de Demanda para Temporada Festiva & Feriados',
          categoria: 'Inteligencia de Mercado',
          periodo: 'Proyección Q1 2027 (Carnaval de Oruro & Festividades)',
          fechaEmision: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
          resumenEjecutivo: 'Mediante el análisis de series temporales de búsqueda y reservas anticipadas, se proyecta un pico de ocupación del 96% en Oruro y Tarija para febrero y marzo de 2027. Se sugiere a la Dirección anticipar la captación de al menos 85 nuevas propiedades residenciales para mitigar el desborde hotelero habitual en dichas festividades.',
          kpis: [
            { etiqueta: 'Ocupación Proyectada (Oruro)', valor: '96.4%', variacion: '+18.0% alta demanda', esPositivo: true },
            { etiqueta: 'Tarifa Promedio Noche Estimada', valor: '820 BOB', variacion: '+25.0% estacional', esPositivo: true },
            { etiqueta: 'Déficit de Camas Previsto', valor: '~450 camas', variacion: 'Requiere captación', esPositivo: false }
          ],
          puntosClave: [
            'Las búsquedas para el Carnaval de Oruro crecieron un 64% en las últimas 3 semanas desde ciudades del eje central.',
            'Tarija presenta un 78% de reservas comprometidas para la temporada de Vendimia Chapaca 2027.',
            'Los anfitriones con certificación verificada capturan reservas con un anticipo promedio de 42 días.'
          ],
          recomendacionesEstrategicas: [
            'Lanzar campaña de afiliación express para residentes de Oruro con viviendas aptas para hospedaje temporal.',
            'Habilitar tarifa dinámica sugerida por IA para orientar a los anfitriones a no inflar precios desproporcionadamente.',
            'Coordinar con las gobernaciones departamentales la acreditación de licencias temporales de turismo.'
          ]
        };
      } else {
        this.reporteActual = {
          titulo: 'Auditoría Preventiva de Calidad & Detección de Inconsistencias',
          categoria: 'Seguridad Operativa & Fraude',
          periodo: 'Semana 43 — 2026',
          fechaEmision: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
          resumenEjecutivo: 'El motor de auditoría preventiva analizó 342 alojamientos y 1,280 operaciones de reserva. Se detectó un índice de salubridad operativa del 99.4%, con solo 1 propiedad con fotos sospechosas de baja resolución que fue pausada preventivamente para verificación de identidad del propietario.',
          kpis: [
            { etiqueta: 'Índice de Confiabilidad', valor: '99.4%', variacion: 'Excelente', esPositivo: true },
            { etiqueta: 'Alertas de Precios Anómalos', valor: '0 casos', variacion: '0% desvío', esPositivo: true },
            { etiqueta: 'Propiedades en Pausa Preventiva', valor: '1 solicitud', variacion: 'En inspección', esPositivo: false }
          ],
          puntosClave: [
            'No se identificaron intentos de transacciones duplicadas ni colisiones en el bloqueo atómico de inventario.',
            'Los tiempos de respuesta del código secreto de Check-in en frontera offline registraron un éxito del 100%.',
            'Se verificó que ninguna propiedad aprobada carezca de geolocalización satelital precisa.'
          ],
          recomendacionesEstrategicas: [
            'Mantener el filtro obligatorio de verificación de cédula de identidad para todo nuevo anfitrión antes de autorizar su primer cobro.',
            'Incorporar validación biométrica opcional para anfitriones con más de 5 propiedades administradas.'
          ]
        };
      }
    }, 900);
  }

  exportarPdfSimulado() {
    alert('Generando y descargando documento oficial en formato PDF para archivo de la Dirección General...');
  }

  exportarExcelSimulado() {
    alert('Exportando Libro Diario y métricas consolidadas en formato XLSX...');
  }
}
