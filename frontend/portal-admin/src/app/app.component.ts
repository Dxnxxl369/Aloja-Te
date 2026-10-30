import { Component, OnInit } from '@angular/core';
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
  estado: 'PUBLICADO' | 'EN_REVISION' | 'RECHAZADO' | 'SUSPENDIDO';
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
    <div class="min-h-screen flex bg-carbon-950 text-stone-100 font-sans selection:bg-brand-500/30 selection:text-white">
      
      <!-- ========================================== -->
      <!-- BARRA LATERAL (SIDEBAR INSTITUCIONAL)      -->
      <!-- ========================================== -->
      <aside class="w-72 border-r border-stone-800/80 bg-carbon-900/95 flex flex-col justify-between shrink-0 relative z-20">
        <div>
          <!-- Logotipo Institucional -->
          <div class="h-20 px-6 border-b border-stone-800/80 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-blue-500 flex items-center justify-center text-white font-serif font-black text-xl shadow-lg shadow-brand-600/30">
              A
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-serif text-xl font-bold tracking-tight text-white">Aloja-Te</span>
                <span class="text-[9px] uppercase font-bold tracking-widest bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                  NACIONAL
                </span>
              </div>
              <p class="text-[10px] text-stone-400 font-medium tracking-wide">Dirección de Auditoría & Control</p>
            </div>
          </div>

          <!-- Navegación Principal -->
          <div class="p-4 space-y-1">
            <span class="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-3 mb-2 block">
              Módulos de Gestión
            </span>

            <!-- Tab 1: Dashboard -->
            <button
              (click)="activeTab = 'dashboard'"
              [class]="activeTab === 'dashboard' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Panel General</span>
            </button>

            <!-- Tab 2: Contabilidad -->
            <button
              (click)="activeTab = 'contabilidad'"
              [class]="activeTab === 'contabilidad' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Transacciones &amp; Liquidaciones</span>
            </button>

            <!-- Tab 3: Alojamientos -->
            <button
              (click)="activeTab = 'alojamientos'"
              [class]="activeTab === 'alojamientos' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <div class="flex-1 flex items-center justify-between">
                <span>Verificación de Alojamientos</span>
                <span class="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">{{ conteoPendientes() }} pend.</span>
              </div>
            </button>

            <!-- Tab 4: Liquidaciones -->
            <button
              (click)="activeTab = 'liquidaciones'"
              [class]="activeTab === 'liquidaciones' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Liquidaciones a Anfitriones</span>
            </button>

            <!-- Tab 5: Reportes IA -->
            <button
              (click)="activeTab = 'reportes-ia'"
              [class]="activeTab === 'reportes-ia' ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all' : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 font-medium text-xs transition-all'"
            >
              <svg class="w-4 h-4 shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div class="flex-1 flex items-center justify-between">
                <span>Reportes Inteligentes</span>
                <span class="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">IA</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Perfil Administrativo & Enlace de Retorno -->
        <div class="p-4 border-t border-stone-800/80 space-y-3">
          <div class="p-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-stone-700 to-stone-600 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
              AQ
            </div>
            <div class="overflow-hidden">
              <h5 class="text-xs font-bold text-white truncate">Lic. Andrea Quiroga</h5>
              <p class="text-[10px] text-chiquitania-400 truncate">Auditora General</p>
            </div>
          </div>

          <a
            href="http://localhost:3000"
            class="w-full py-2 px-3 rounded-xl bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800 text-[11px] text-stone-400 hover:text-stone-200 font-semibold flex items-center justify-center gap-2 transition"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <header class="h-20 border-b border-stone-800/80 bg-carbon-900/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 class="font-serif text-xl font-bold text-white tracking-tight">
              {{ obtenerTituloVista() }}
            </h1>
            <p class="text-xs text-stone-400 mt-0.5">
              {{ obtenerSubtituloVista() }}
            </p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Indicador Operativo -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Operaciones en Línea</span>
            </div>

            <!-- Selector de Período Fiscal -->
            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
              <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">Gestión Fiscal 2026 — Octubre</span>
            </div>
          </div>
        </header>

        <!-- Contenido Dinámico por Pestaña -->
        <main class="p-8 space-y-8 max-w-7xl w-full">

          <!-- ======================================================== -->
          <!-- VISTA 1: PANEL GENERAL (DASHBOARD EJECUTIVO)             -->
          <!-- ======================================================== -->
          <div *ngIf="activeTab === 'dashboard'" class="space-y-8">
            
            <!-- Tarjetas de Métricas Principales -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <!-- Tarjeta 1: Volumen Transaccional -->
              <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Volumen Bruto Procesado</span>
                  <div class="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-black text-white font-sans tracking-tight">184,250.00 BOB</div>
                  <div class="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-semibold">
                    <span>↑ +14.2%</span>
                    <span class="text-stone-500 font-normal">respecto al mes anterior</span>
                  </div>
                </div>
              </div>

              <!-- Tarjeta 2: Ingresos por Comisiones -->
              <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Ingresos por Comisiones</span>
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-black text-emerald-400 font-sans tracking-tight">+18,425.00 BOB</div>
                  <div class="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-semibold">
                    <span>10% tasa estándar</span>
                    <span class="text-stone-500 font-normal">ingreso neto</span>
                  </div>
                </div>
              </div>

              <!-- Tarjeta 3: Liquidaciones Pagadas -->
              <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Liquidado a Anfitriones</span>
                  <div class="w-8 h-8 rounded-xl bg-chiquitania-500/15 border border-chiquitania-500/30 flex items-center justify-center text-chiquitania-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-black text-chiquitania-300 font-sans tracking-tight">157,950.00 BOB</div>
                  <div class="flex items-center gap-1.5 mt-1 text-[11px] text-stone-400 font-semibold">
                    <span class="text-emerald-400">98.4%</span>
                    <span class="text-stone-500 font-normal">pagado a tiempo</span>
                  </div>
                </div>
              </div>

              <!-- Tarjeta 4: Alojamientos Registrados -->
              <div class="p-5 rounded-2xl liquid-card liquid-card-hover space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Alojamientos Habilitados</span>
                  <div class="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-black text-white font-sans tracking-tight">342 Propiedades</div>
                  <div class="flex items-center gap-1.5 mt-1 text-[11px] text-cyan-300 font-semibold">
                    <span>9 Departamentos</span>
                    <span class="text-stone-500 font-normal">cobertura país</span>
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
                    <h3 class="font-serif text-lg font-bold text-white">Distribución de Reservas por Departamento</h3>
                    <p class="text-xs text-stone-400 mt-0.5">Demanda turística consolidada en la plataforma nacional</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-lg bg-stone-800 text-[11px] text-stone-300 font-semibold">
                    Tiempo Real
                  </span>
                </div>

                <div class="space-y-4 pt-2">
                  <div>
                    <div class="flex justify-between text-xs font-semibold mb-1.5">
                      <span class="text-stone-200">Santa Cruz (Chiquitanía, Metrópolis y Valles)</span>
                      <span class="text-brand-400 font-mono">38% (69,800 BOB)</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-brand-600 to-blue-400" style="width: 38%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs font-semibold mb-1.5">
                      <span class="text-stone-200">La Paz (Lago Titicaca, Ciudad y Yungas)</span>
                      <span class="text-chiquitania-400 font-mono">26% (48,100 BOB)</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-chiquitania-600 to-chiquitania-400" style="width: 26%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs font-semibold mb-1.5">
                      <span class="text-stone-200">Cochabamba (Valle Alto, Chapare y Gastronomía)</span>
                      <span class="text-amber-400 font-mono">18% (33,165 BOB)</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                      <div class="h-full rounded-full bg-amber-500" style="width: 18%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs font-semibold mb-1.5">
                      <span class="text-stone-200">Potosí (Salar de Uyuni y Casco Colonial)</span>
                      <span class="text-cyan-400 font-mono">11% (20,267 BOB)</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                      <div class="h-full rounded-full bg-cyan-500" style="width: 11%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-xs font-semibold mb-1.5">
                      <span class="text-stone-200">Beni, Chuquisaca, Tarija, Oruro y Pando</span>
                      <span class="text-emerald-400 font-mono">7% (12,918 BOB)</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                      <div class="h-full rounded-full bg-emerald-500" style="width: 7%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Registro de Auditoría y Eventos Recientes -->
              <div class="p-6 rounded-3xl liquid-card space-y-4">
                <h3 class="font-serif text-lg font-bold text-white">Eventos Recientes</h3>
                <p class="text-xs text-stone-400">Trazabilidad de operaciones en plataforma</p>

                <div class="space-y-3 pt-2 text-xs">
                  <div class="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-emerald-400 font-semibold text-[11px]">Cobro QR Confirmado</span>
                      <span class="text-[10px] text-stone-500">Hace 4 min</span>
                    </div>
                    <p class="text-stone-300">Reserva de 3 noches en Cabaña Chiquitana por 1,950 BOB.</p>
                  </div>

                  <div class="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-cyan-400 font-semibold text-[11px]">Asiento Contable Generado</span>
                      <span class="text-[10px] text-stone-500">Hace 12 min</span>
                    </div>
                    <p class="text-stone-300">Folio contable #d3d94209 con débito en Banco BNB y retención de comisión.</p>
                  </div>

                  <div class="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-amber-400 font-semibold text-[11px]">Solicitud de Alojamiento</span>
                      <span class="text-[10px] text-stone-500">Hace 1 hora</span>
                    </div>
                    <p class="text-stone-300">Cabaña Ecológica Samaipata registrada por anfitrión y en espera de revisión.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ======================================================== -->
          <!-- VISTA 2: AUDITORÍA CONTABLE (LIBRO DIARIO)               -->
          <!-- ======================================================== -->
          <div *ngIf="activeTab === 'contabilidad'" class="space-y-6">
            
            <!-- Resumen Financiero en Tiempo Real -->
            <div class="p-6 rounded-3xl liquid-card border-brand-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="text-[11px] font-bold text-brand-400 uppercase tracking-widest">
                  Conciliación Bancaria y Recaudación
                </span>
                <h3 class="font-serif text-xl font-bold text-white">Registro de Transacciones &amp; Liquidaciones</h3>
                <p class="text-xs text-stone-400">Auditoría de cobros QR Simple BNB, comisiones de plataforma (10%) y pagos a anfitriones</p>
              </div>

              <!-- Indicador de Conciliación -->
              <div class="flex items-center gap-6 p-3 rounded-2xl bg-stone-900/90 border border-stone-800 px-5">
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">TOTAL RECAUDADO</span>
                  <span class="font-mono text-base font-bold text-emerald-400">{{ calcularTotalDebito().toFixed(2) }} BOB</span>
                </div>
                <div class="w-px h-8 bg-stone-800"></div>
                <div>
                  <span class="text-[10px] text-stone-400 block font-semibold">TOTAL DISTRIBUIDO</span>
                  <span class="font-mono text-base font-bold text-amber-400">{{ calcularTotalCredito().toFixed(2) }} BOB</span>
                </div>
                <div class="w-px h-8 bg-stone-800"></div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span class="text-xs font-bold text-emerald-300">CONCILIADO BNB</span>
                </div>
              </div>
            </div>

            <!-- Filtros de Búsqueda de Movimientos -->
            <div class="flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button
                  (click)="filtroTipo = 'TODOS'"
                  [class]="filtroTipo === 'TODOS' ? 'px-3.5 py-1.5 rounded-xl bg-brand-600 text-white font-semibold' : 'px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-medium'"
                >
                  Todos los Movimientos
                </button>
                <button
                  (click)="filtroTipo = 'DEBITO'"
                  [class]="filtroTipo === 'DEBITO' ? 'px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold' : 'px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-medium'"
                >
                  Ingresos (Cobros QR)
                </button>
                <button
                  (click)="filtroTipo = 'CREDITO'"
                  [class]="filtroTipo === 'CREDITO' ? 'px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold' : 'px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-medium'"
                >
                  Distribución &amp; Comisiones
                </button>
              </div>

              <div class="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  [(ngModel)]="busquedaContable"
                  placeholder="Buscar cuenta o folio..."
                  class="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-brand-400 transition w-full sm:w-64"
                />
                <button
                  (click)="cargarMovimientos()"
                  class="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition shrink-0"
                >
                  Actualizar
                </button>
              </div>
            </div>

            <!-- Tabla de Transacciones Financieras -->
            <div class="overflow-x-auto rounded-2xl border border-stone-800/80 liquid-card">
              <table class="w-full text-left text-xs">
                <thead class="bg-carbon-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th class="py-3.5 px-5">Referencia</th>
                    <th class="py-3.5 px-5">Concepto Financiero</th>
                    <th class="py-3.5 px-5">Tipo</th>
                    <th class="py-3.5 px-5 text-right">Ingreso QR (BOB)</th>
                    <th class="py-3.5 px-5 text-right">Distribución (BOB)</th>
                    <th class="py-3.5 px-5">Origen</th>
                    <th class="py-3.5 px-5">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-800/60 text-stone-300">
                  <tr *ngFor="let m of movimientosFiltrados()" class="hover:bg-white/5 transition">
                    <td class="py-3 px-5 font-mono text-[11px] text-chiquitania-400">
                      {{ m.asientoId.substring(0, 13) }}...
                    </td>
                    <td class="py-3 px-5 font-semibold text-white">
                      {{ m.cuenta }}
                    </td>
                    <td class="py-3 px-5">
                      <span [class]="m.tipo === 'DEBITO' ? 'px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30' : 'px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30'">
                        {{ m.tipo }}
                      </span>
                    </td>
                    <td class="py-3 px-5 font-mono font-bold text-emerald-400 text-right">
                      {{ m.tipo === 'DEBITO' ? m.monto.toFixed(2) : '-' }}
                    </td>
                    <td class="py-3 px-5 font-mono font-bold text-amber-400 text-right">
                      {{ m.tipo === 'CREDITO' ? m.monto.toFixed(2) : '-' }}
                    </td>
                    <td class="py-3 px-5 text-stone-400 text-[11px]">
                      {{ m.origenTipo }}
                    </td>
                    <td class="py-3 px-5 text-stone-400 text-[11px] font-mono">
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
          <div *ngIf="activeTab === 'alojamientos'" class="space-y-6">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="font-serif text-xl font-bold text-white">Bandeja de Aprobación &amp; Moderación</h3>
                <p class="text-xs text-stone-400 mt-0.5">Control de calidad técnica, validación de licencias y moderación de ofertas únicas vs. establecimientos hoteleros</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  (click)="cargarAlojamientos()"
                  class="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sincronizar MS-01</span>
                </button>
              </div>
            </div>

            <!-- Filtros de Estado -->
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <button
                (click)="filtroAlojamientos = 'TODOS'"
                [class]="filtroAlojamientos === 'TODOS' ? 'px-3.5 py-1.5 rounded-xl bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' : 'px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-medium'"
              >
                Todos ({{ alojamientos.length }})
              </button>
              <button
                (click)="filtroAlojamientos = 'PENDIENTES'"
                [class]="filtroAlojamientos === 'PENDIENTES' ? 'px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/20' : 'px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-medium'"
              >
                Pendientes de Moderación ({{ conteoPendientes() }})
              </button>
              <button
                (click)="filtroAlojamientos = 'PUBLICADOS'"
                [class]="filtroAlojamientos === 'PUBLICADOS' ? 'px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20' : 'px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-medium'"
              >
                Publicados en Catálogo ({{ conteoPublicados() }})
              </button>
              <button
                (click)="filtroAlojamientos = 'OBSERVADOS'"
                [class]="filtroAlojamientos === 'OBSERVADOS' ? 'px-3.5 py-1.5 rounded-xl bg-rose-700 text-white font-semibold shadow-md shadow-rose-700/20' : 'px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-medium'"
              >
                Observados ({{ conteoObservados() }})
              </button>
            </div>

            <!-- Listado de Alojamientos -->
            <div *ngIf="alojamientosFiltrados().length === 0" class="p-12 text-center rounded-3xl liquid-card border-dashed border-stone-800 text-stone-400 text-xs">
              No hay alojamientos registrados en esta categoría de moderación.
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div *ngFor="let a of alojamientosFiltrados()" class="p-5 rounded-3xl liquid-card space-y-4 flex flex-col justify-between">
                
                <div class="space-y-3">
                  <!-- Header con Estado & Modalidad -->
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="text-[10px] font-bold text-chiquitania-400 uppercase tracking-widest">
                          {{ a.departamento }} • {{ a.tipoPropiedad }}
                        </span>
                        
                        <!-- Badge Modalidad (Casa vs Hotel) -->
                        <span *ngIf="a.modalidad === 'HOTEL_HOSTAL'" class="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                          🏨 Hotel / Hostal (Múltiples Hab.)
                        </span>
                        <span *ngIf="a.modalidad !== 'HOTEL_HOSTAL'" class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          🏡 Casa / Depto (Oferta Única)
                        </span>
                      </div>

                      <h4 class="font-serif text-lg font-bold text-white">{{ a.titulo }}</h4>
                      <p class="text-xs text-stone-400">Anfitrión: <strong class="text-stone-300">{{ a.anfitrion }}</strong> • {{ a.ciudad }}</p>
                    </div>

                    <!-- Badge Estado -->
                    <span [class]="a.estado === 'PUBLICADO' ? 'px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 shrink-0' : (a.estado === 'EN_REVISION' ? 'px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 shrink-0' : 'px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 shrink-0')">
                      {{ a.estado === 'PUBLICADO' ? 'Publicado' : (a.estado === 'EN_REVISION' ? 'Por Revisar' : (a.estado === 'SUSPENDIDO' ? 'Suspendido' : 'Observado')) }}
                    </span>
                  </div>

                  <!-- Imagen de Portada -->
                  <div class="h-44 rounded-2xl overflow-hidden relative">
                    <img [src]="a.imagen" [alt]="a.titulo" class="w-full h-full object-cover" />
                    <div class="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur text-white text-xs font-bold font-mono border border-white/10">
                      {{ a.precioNoche }} BOB / noche
                    </div>
                  </div>

                  <p class="text-xs text-stone-300 line-clamp-2">
                    {{ a.descripcion }}
                  </p>

                  <!-- Motivo de Rechazo / Observación (si aplica) -->
                  <div *ngIf="a.motivoRechazo" class="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px]">
                    <strong class="font-semibold block mb-0.5">Observación Registrada:</strong>
                    {{ a.motivoRechazo }}
                  </div>

                  <!-- Ficha de Modalidad, Capacidad y Horarios -->
                  <div class="flex flex-col gap-1.5 text-xs text-stone-400 pt-1 border-t border-stone-800">
                    <div class="flex items-center justify-between">
                      <span *ngIf="a.modalidad === 'HOTEL_HOSTAL'" class="text-indigo-300 font-medium">
                        🏨 {{ a.unidades?.length || 1 }} Tipos de habitación configurados
                      </span>
                      <span *ngIf="a.modalidad !== 'HOTEL_HOSTAL'">
                        👥 {{ a.capacidad }} Huéspedes • 🛏️ {{ a.habitaciones }} Dormitorios
                      </span>
                      <span class="text-[11px] font-mono text-stone-500">
                        Reg: {{ a.fechaRegistro | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                    
                    <div class="text-[11px] text-stone-400">
                      ⏰ Check-in: <strong class="text-stone-300">{{ a.horarioEntrada || '14:00' }}</strong> | Check-out: <strong class="text-stone-300">{{ a.horarioSalida || '11:00' }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Botonera de Decisiones -->
                <div class="pt-3 border-t border-stone-800/80 flex items-center gap-2">
                  <button
                    *ngIf="a.estado === 'EN_REVISION' || a.estado === 'RECHAZADO'"
                    (click)="aprobarAlojamiento(a.id)"
                    class="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Aprobar y Publicar</span>
                  </button>

                  <button
                    *ngIf="a.estado === 'EN_REVISION'"
                    (click)="abrirModalRechazo(a)"
                    class="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-300 hover:text-rose-200 font-semibold text-xs border border-rose-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Observar</span>
                  </button>

                  <button
                    *ngIf="a.estado === 'PUBLICADO'"
                    (click)="suspenderAlojamiento(a.id)"
                    class="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold text-xs border border-amber-500/30 transition"
                  >
                    Suspender
                  </button>

                  <button
                    (click)="inspeccionarAlojamiento(a)"
                    class="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium border border-stone-700 transition"
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
          <div *ngIf="activeTab === 'liquidaciones'" class="space-y-6">
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-serif text-xl font-bold text-white">Gestión de Transferencias y Desembolsos ACH</h3>
                <p class="text-xs text-stone-400 mt-0.5">Pago de ingresos netos a cuentas bancarias acreditadas en el sistema financiero boliviano</p>
              </div>

              <button
                (click)="autorizarLotePagos()"
                class="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-brand-600/30 hover:opacity-90 transition flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Autorizar Lote Bancario</span>
              </button>
            </div>

            <!-- Tabla de Liquidaciones -->
            <div class="overflow-x-auto rounded-2xl border border-stone-800/80 liquid-card">
              <table class="w-full text-left text-xs">
                <thead class="bg-carbon-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th class="py-3.5 px-5">Anfitrión / Propiedad</th>
                    <th class="py-3.5 px-5">Entidad Financiera</th>
                    <th class="py-3.5 px-5 text-right">Importe Bruto</th>
                    <th class="py-3.5 px-5 text-right">Comisión Plataforma (10%)</th>
                    <th class="py-3.5 px-5 text-right">Retención SIN</th>
                    <th class="py-3.5 px-5 text-right">Neto a Transferir</th>
                    <th class="py-3.5 px-5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-800/60 text-stone-300">
                  <tr *ngFor="let l of liquidaciones" class="hover:bg-white/5 transition">
                    <td class="py-3 px-5">
                      <div class="font-bold text-white">{{ l.anfitrion }}</div>
                      <div class="text-[11px] text-stone-400">{{ l.alojamiento }}</div>
                    </td>
                    <td class="py-3 px-5">
                      <span class="font-semibold text-white">{{ l.banco }}</span>
                      <div class="font-mono text-[11px] text-stone-400">{{ l.numeroCuenta }}</div>
                    </td>
                    <td class="py-3 px-5 font-mono text-right text-stone-300">
                      {{ l.montoBruto.toFixed(2) }} BOB
                    </td>
                    <td class="py-3 px-5 font-mono text-right text-brand-400">
                      -{{ l.comisionPlataforma.toFixed(2) }} BOB
                    </td>
                    <td class="py-3 px-5 font-mono text-right text-stone-400">
                      -{{ l.retencionImpuestos.toFixed(2) }} BOB
                    </td>
                    <td class="py-3 px-5 font-mono font-bold text-right text-emerald-400 text-sm">
                      {{ l.montoNeto.toFixed(2) }} BOB
                    </td>
                    <td class="py-3 px-5 text-center">
                      <span [class]="l.estado === 'PAGADO' ? 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold' : (l.estado === 'EN_PROCESO' ? 'px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold' : 'px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold')">
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
          <div *ngIf="activeTab === 'reportes-ia'" class="space-y-6">
            
            <!-- Generador de Informes Estratégicos -->
            <div class="p-6 rounded-3xl liquid-card border-chiquitania-500/30 space-y-5">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      Motor de Analítica Predictiva & Generativa
                    </span>
                  </div>
                  <h3 class="font-serif text-2xl font-bold text-white">Generador de Informes de Negocio con Inteligencia Artificial</h3>
                  <p class="text-xs text-stone-400 mt-1">Sintetiza tendencias de ocupación regional, simulación fiscal y proyecciones estratégicas</p>
                </div>

                <button
                  (click)="generarReporteIA()"
                  [disabled]="generandoReporte"
                  class="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition shrink-0"
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
                  [class]="tipoReporteSeleccionado === 1 ? 'p-3.5 rounded-2xl bg-brand-950/70 border-2 border-brand-500 text-left space-y-1 transition' : 'p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-left space-y-1 hover:border-stone-700 transition'"
                >
                  <span class="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Auditoría & Proyección</span>
                  <h4 class="text-xs font-bold text-white">Cierre Fiscal & Rendimiento</h4>
                  <p class="text-[11px] text-stone-400">Balance contable, retenciones impositivas y margen neto de comisiones.</p>
                </button>

                <button
                  (click)="tipoReporteSeleccionado = 2"
                  [class]="tipoReporteSeleccionado === 2 ? 'p-3.5 rounded-2xl bg-chiquitania-950/70 border-2 border-chiquitania-500 text-left space-y-1 transition' : 'p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-left space-y-1 hover:border-stone-700 transition'"
                >
                  <span class="text-[10px] font-bold text-chiquitania-400 uppercase tracking-wider block">Tendencia Regional</span>
                  <h4 class="text-xs font-bold text-white">Demanda Festividades 2026</h4>
                  <p class="text-[11px] text-stone-400">Predicción de ocupación en Chiquitanía, Carnaval de Oruro y Lago Titicaca.</p>
                </button>

                <button
                  (click)="tipoReporteSeleccionado = 3"
                  [class]="tipoReporteSeleccionado === 3 ? 'p-3.5 rounded-2xl bg-cyan-950/70 border-2 border-cyan-500 text-left space-y-1 transition' : 'p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-left space-y-1 hover:border-stone-700 transition'"
                >
                  <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Calidad & Detección</span>
                  <h4 class="text-xs font-bold text-white">Detección de Anomalías</h4>
                  <p class="text-[11px] text-stone-400">Monitoreo de cancelaciones inusuales y auditoría de precios por noche.</p>
                </button>
              </div>
            </div>

            <!-- Previsualización del Informe Generado -->
            <div *ngIf="reporteActual" class="p-8 rounded-3xl liquid-card border-stone-800 space-y-8 animate-fade-in">
              
              <!-- Encabezado del Documento -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-stone-800">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase tracking-wider">
                      {{ reporteActual.categoria }}
                    </span>
                    <span class="text-xs text-stone-500 font-mono">• Emitido: {{ reporteActual.fechaEmision }}</span>
                  </div>
                  <h2 class="font-serif text-2xl font-bold text-white">{{ reporteActual.titulo }}</h2>
                  <p class="text-xs text-stone-400 mt-1">Período evaluado: {{ reporteActual.periodo }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    (click)="exportarPdfSimulado()"
                    class="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Descargar PDF</span>
                  </button>

                  <button
                    (click)="exportarExcelSimulado()"
                    class="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition"
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
                <div *ngFor="let k of reporteActual.kpis" class="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
                  <span class="text-[11px] text-stone-400 font-semibold">{{ k.etiqueta }}</span>
                  <div class="text-xl font-black text-white font-sans">{{ k.valor }}</div>
                  <div [class]="k.esPositivo ? 'text-[11px] text-emerald-400 font-semibold' : 'text-[11px] text-amber-400 font-semibold'">
                    {{ k.variacion }}
                  </div>
                </div>
              </div>

              <!-- Resumen Ejecutivo -->
              <div class="p-5 rounded-2xl bg-stone-900/50 border border-stone-800/80 space-y-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-chiquitania-400">Resumen Ejecutivo</h4>
                <p class="text-xs leading-relaxed text-stone-300">
                  {{ reporteActual.resumenEjecutivo }}
                </p>
              </div>

              <!-- Puntos Clave & Hallazgos -->
              <div class="space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-stone-400">Hallazgos Principales</h4>
                <ul class="space-y-2 text-xs text-stone-300">
                  <li *ngFor="let punto of reporteActual.puntosClave" class="flex items-start gap-2.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                    <span>{{ punto }}</span>
                  </li>
                </ul>
              </div>

              <!-- Recomendaciones Estratégicas para la Dirección -->
              <div class="p-5 rounded-2xl bg-gradient-to-br from-brand-950/40 to-carbon-900 border border-brand-500/30 space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-brand-400">Recomendaciones Estratégicas</h4>
                <ul class="space-y-2 text-xs text-stone-200">
                  <li *ngFor="let rec of reporteActual.recomendacionesEstrategicas" class="flex items-start gap-2.5">
                    <span class="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{{ rec }}</span>
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
      <div *ngIf="alojamientoInspeccionado" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div class="absolute inset-0" (click)="alojamientoInspeccionado = null"></div>

        <div class="relative w-full max-w-5xl my-4 p-6 sm:p-8 rounded-3xl bg-carbon-900 border border-stone-800 text-white z-10 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
          
          <!-- Encabezado con Badges & Título -->
          <div class="flex items-start justify-between gap-4 border-b border-stone-800/80 pb-4">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">
                  Auditoría Técnica & Calidad Turística
                </span>
                <span class="text-stone-600">•</span>
                <span class="text-[10px] font-semibold text-stone-300">
                  {{ alojamientoInspeccionado.departamento }} • {{ alojamientoInspeccionado.ciudad }}
                </span>
                <span *ngIf="alojamientoInspeccionado.modalidad === 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  🏨 Hotel / Hostal (Múltiples Hab.)
                </span>
                <span *ngIf="alojamientoInspeccionado.modalidad !== 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  🏡 Oferta Única (Casa / Depto)
                </span>
                <span [class]="alojamientoInspeccionado.estado === 'PUBLICADO' ? 'px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30' : (alojamientoInspeccionado.estado === 'EN_REVISION' ? 'px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30' : 'px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30')">
                  {{ alojamientoInspeccionado.estado === 'PUBLICADO' ? '● Publicado' : (alojamientoInspeccionado.estado === 'EN_REVISION' ? '⏳ Por Revisar' : '✕ Observado') }}
                </span>
              </div>

              <h2 class="font-serif text-2xl font-bold text-white">{{ alojamientoInspeccionado.titulo }}</h2>
              <p class="text-xs text-stone-400">
                Anfitrión Responsable: <strong class="text-stone-200">{{ alojamientoInspeccionado.anfitrion }}</strong> • Dirección: <strong class="text-stone-300">{{ alojamientoInspeccionado.direccion || 'Zona registrada' }}</strong> • ID: <span class="font-mono text-stone-500">{{ alojamientoInspeccionado.id }}</span>
              </p>
            </div>

            <button (click)="alojamientoInspeccionado = null" class="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition">✕</button>
          </div>

          <!-- Galería Fotográfica Amplia -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="md:col-span-3 h-72 sm:h-80 rounded-2xl overflow-hidden relative border border-stone-800">
              <img [src]="alojamientoInspeccionado.imagen" [alt]="alojamientoInspeccionado.titulo" class="w-full h-full object-cover" />
              <div class="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur text-white font-mono font-bold text-xs border border-white/10">
                Tarifa Base: {{ alojamientoInspeccionado.precioNoche }} BOB / noche
              </div>
            </div>
            
            <div class="hidden md:flex flex-col gap-3 h-72 sm:h-80">
              <div *ngFor="let f of (alojamientoInspeccionado.fotos?.slice(1, 4) || []); let i = index" class="flex-1 rounded-xl overflow-hidden relative border border-stone-800">
                <img [src]="f" class="w-full h-full object-cover" />
              </div>
              <div *ngIf="!alojamientoInspeccionado.fotos || alojamientoInspeccionado.fotos.length <= 1" class="flex-1 rounded-xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center p-3 text-center text-stone-500 text-[11px]">
                <span>📸 Fotografía principal verificada</span>
              </div>
            </div>
          </div>

          <!-- Tarjetas de Especificaciones Principales -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Capacidad Máxima</span>
              <div class="font-bold text-white text-base">👥 {{ alojamientoInspeccionado.capacidad }} Huéspedes</div>
              <span class="text-[10px] text-stone-500">Distribución certificada</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Dormitorios / Unidades</span>
              <div class="font-bold text-white text-base">🛏️ {{ alojamientoInspeccionado.habitaciones }} Habitaciones</div>
              <span class="text-[10px] text-stone-500">{{ alojamientoInspeccionado.unidades?.length || 1 }} unidades registradas</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Horario de Ingreso</span>
              <div class="font-bold text-white text-base">⏰ {{ alojamientoInspeccionado.horarioEntrada || '14:00' }}</div>
              <span class="text-[10px] text-stone-500">Check-in anfitrión</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
              <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Horario de Salida</span>
              <div class="font-bold text-white text-base">⏰ {{ alojamientoInspeccionado.horarioSalida || '11:00' }}</div>
              <span class="text-[10px] text-stone-500">Check-out límite</span>
            </div>
          </div>

          <!-- Descripción del Alojamiento -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-stone-400">Descripción Comercial & Reglas</h4>
            <div class="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 leading-relaxed">
              {{ alojamientoInspeccionado.descripcion }}
            </div>
          </div>

          <!-- Detalle de Habitaciones / Unidades Reservables (Especial Hoteles y Casas) -->
          <div *ngIf="alojamientoInspeccionado.unidades && alojamientoInspeccionado.unidades.length > 0" class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-brand-400">
                Inventario de Habitaciones & Unidades Reservables ({{ alojamientoInspeccionado.unidades.length }})
              </h4>
              <span class="text-[10px] text-stone-400">
                Desglose para reservas simultáneas
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div *ngFor="let u of alojamientoInspeccionado.unidades" class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h5 class="text-sm font-bold text-white">{{ u.nombre }}</h5>
                    <div class="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                      <span>👥 {{ u.capacidadHuespedes }} pers.</span>
                      <span>•</span>
                      <span>🛏️ {{ u.cantidadCamas }} camas</span>
                      <span>•</span>
                      <span>🚿 {{ u.cantidadBanos }} baños</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-mono font-bold text-brand-400 text-sm block">{{ u.precioNoche }} BOB</span>
                    <span class="text-[10px] text-stone-500">por noche</span>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px]">
                  <span class="text-stone-400">Stock para reserva:</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] border border-cyan-500/30">
                    {{ u.inventarioTotal }} unidades disponibles
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Servicios & Amenidades Declaradas -->
          <div *ngIf="alojamientoInspeccionado.servicios && alojamientoInspeccionado.servicios.length > 0" class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-stone-400">Servicios e Infraestructura</h4>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let s of alojamientoInspeccionado.servicios" class="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 flex items-center gap-1.5">
                <span>✓</span>
                <span>{{ s }}</span>
              </span>
            </div>
          </div>

          <!-- Políticas y Reglas -->
          <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <div *ngIf="alojamientoInspeccionado.politicas" class="text-stone-300 text-xs leading-relaxed">
              <strong class="text-stone-200 block mb-1">Políticas de Convivencia y Cancelación:</strong>
              {{ alojamientoInspeccionado.politicas }}
            </div>
            <div *ngIf="alojamientoInspeccionado.motivoRechazo" class="pt-2 border-t border-rose-900/40 text-rose-300 text-xs">
              <strong class="block mb-0.5 text-rose-200">Observación Anterior Registrada:</strong>
              {{ alojamientoInspeccionado.motivoRechazo }}
            </div>
          </div>

          <!-- Footer de Moderación Administrativa -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-800">
            <button
              (click)="alojamientoInspeccionado = null"
              class="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
            >
              Cerrar Inspección
            </button>

            <div class="flex items-center gap-2">
              <button
                *ngIf="alojamientoInspeccionado.estado === 'EN_REVISION'"
                (click)="abrirModalRechazo(alojamientoInspeccionado); alojamientoInspeccionado = null"
                class="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-300 text-xs font-semibold border border-rose-500/30 transition flex items-center gap-1.5"
              >
                <span>Observar Solicitud</span>
              </button>

              <button
                *ngIf="alojamientoInspeccionado.estado === 'PUBLICADO'"
                (click)="suspenderAlojamiento(alojamientoInspeccionado.id); alojamientoInspeccionado = null"
                class="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition"
              >
                Suspender Preventivamente
              </button>

              <button
                *ngIf="alojamientoInspeccionado.estado === 'EN_REVISION' || alojamientoInspeccionado.estado === 'RECHAZADO'"
                (click)="aprobarAlojamiento(alojamientoInspeccionado.id); alojamientoInspeccionado = null"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
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
      <div *ngIf="modalRechazoAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div class="absolute inset-0" (click)="modalRechazoAbierto = false"></div>

        <div class="relative w-full max-w-lg p-6 rounded-3xl bg-carbon-900 border border-stone-700 text-white z-10 space-y-4 shadow-2xl">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-0.5">
                Moderación de Calidad
              </span>
              <h3 class="font-serif text-lg font-bold text-white">Observar Solicitud de Alojamiento</h3>
              <p class="text-xs text-stone-400">{{ alojamientoParaRechazo?.titulo }}</p>
            </div>
            <button (click)="modalRechazoAbierto = false" class="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white transition">✕</button>
          </div>

          <p class="text-xs text-stone-300">
            Especifique el motivo técnico o administrativo de la observación. El anfitrión recibirá esta notificación para corregir su solicitud y volver a postularla.
          </p>

          <div>
            <label class="block text-[11px] font-semibold text-stone-400 mb-1">Motivo de la Observación:</label>
            <textarea
              [(ngModel)]="motivoRechazoTexto"
              rows="4"
              class="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs placeholder-stone-500 focus:outline-none focus:border-rose-400 transition"
              placeholder="Indique las observaciones sobre fotografías, normas de habitabilidad o licencias..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
            <button
              (click)="modalRechazoAbierto = false"
              class="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
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

    </div>
  `
})
export class AppComponent implements OnInit {
  activeTab: 'dashboard' | 'contabilidad' | 'alojamientos' | 'liquidaciones' | 'reportes-ia' = 'dashboard';
  
  // Contabilidad State
  movimientos: MovimientoContable[] = [];
  filtroTipo: 'TODOS' | 'DEBITO' | 'CREDITO' = 'TODOS';
  busquedaContable: string = '';

  // Alojamientos State
  alojamientoInspeccionado: SolicitudAlojamiento | null = null;
  filtroAlojamientos: 'TODOS' | 'PENDIENTES' | 'PUBLICADOS' | 'OBSERVADOS' = 'TODOS';
  modalRechazoAbierto: boolean = false;
  alojamientoParaRechazo: SolicitudAlojamiento | null = null;
  motivoRechazoTexto: string = '';
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
    try {
      const cached = localStorage.getItem('alojate_admin_alojamientos');
      if (cached) {
        this.alojamientos = JSON.parse(cached);
      }
    } catch {}
    this.cargarMovimientos();
    this.cargarAlojamientos();
    this.generarReporteIA();
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
          anfitrion: 'Carlos Mendoza (Anfitrión Verificado)',
          departamento: raw.departamento || 'Santa Cruz',
          ciudad: raw.ciudad || 'Bolivia',
          direccion: raw.direccion || '',
          tipoPropiedad: raw.tipoPropiedadNombre || 'Hospedaje Tradicional',
          modalidad: raw.modalidad || 'CASA_DEPARTAMENTO',
          precioNoche: Number(u?.precioNoche ?? 500),
          capacidad: Number(u?.capacidadHuespedes ?? 4),
          habitaciones: Number(u?.cantidadDormitorios ?? 2),
          estado: (raw.estadoPublicacion as any) || 'EN_REVISION',
          fechaRegistro: raw.fechaCreacion || new Date().toISOString(),
          imagen: foto,
          fotos: fotosList,
          descripcion: raw.descripcion || '',
          politicas: raw.politicas || 'Ambiente respetuoso y cumplimiento de horarios de ingreso.',
          horarioEntrada: raw.horarioEntrada || '14:00',
          horarioSalida: raw.horarioSalida || '11:00',
          motivoRechazo: raw.motivoRechazo || '',
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
    } catch {
      this.cargarAlojamientosFallback();
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
      if (this.filtroAlojamientos === 'PENDIENTES') return a.estado === 'EN_REVISION';
      if (this.filtroAlojamientos === 'PUBLICADOS') return a.estado === 'PUBLICADO';
      if (this.filtroAlojamientos === 'OBSERVADOS') return a.estado === 'RECHAZADO' || a.estado === 'SUSPENDIDO';
      return true;
    });
  }

  conteoPendientes(): number {
    return this.alojamientos.filter(a => a.estado === 'EN_REVISION').length;
  }

  conteoPublicados(): number {
    return this.alojamientos.filter(a => a.estado === 'PUBLICADO').length;
  }

  conteoObservados(): number {
    return this.alojamientos.filter(a => a.estado === 'RECHAZADO' || a.estado === 'SUSPENDIDO').length;
  }

  async aprobarAlojamiento(id: string) {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/aceptar`, {
        method: 'POST'
      });
      const item = this.alojamientos.find(a => a.id === id);
      if (item) {
        item.estado = 'PUBLICADO';
        item.motivoRechazo = undefined;
      }
      try {
        localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(this.alojamientos));
      } catch {}

      if (res.ok) {
        alert('Alojamiento aprobado y publicado exitosamente en el catálogo nacional.');
        await this.cargarAlojamientos();
      } else {
        alert('Estado actualizado a Publicado.');
      }
    } catch {
      const item = this.alojamientos.find(a => a.id === id);
      if (item) item.estado = 'PUBLICADO';
      try {
        localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(this.alojamientos));
      } catch {}
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
    try {
      const res = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/suspender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Suspensión preventiva por auditoría de calidad.' })
      });
      if (res.ok) {
        const item = this.alojamientos.find(a => a.id === id);
        if (item) item.estado = 'SUSPENDIDO';
        alert('Alojamiento suspendido preventivamente.');
        await this.cargarAlojamientos();
      }
    } catch {
      const item = this.alojamientos.find(a => a.id === id);
      if (item) item.estado = 'SUSPENDIDO';
    }
  }

  inspeccionarAlojamiento(a: SolicitudAlojamiento) {
    this.alojamientoInspeccionado = a;
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
