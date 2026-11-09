import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudAlojamiento, FiltroAlojamientos } from '../../core/types/admin.types';

@Component({
  selector: 'app-alojamientos-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Subheader con Sincronizador -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">Bandeja de Aprobación & Moderación</h3>
          <p class="text-xs text-slate-500 dark:text-stone-400 mt-0.5">Control de calidad técnica, validación de licencias y moderación de ofertas únicas vs. establecimientos hoteleros</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="onSincronizar.emit()"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 hover:bg-slate-200 dark:hover:bg-stone-800 hover:border-blue-500/30 text-slate-700 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sincronizar MS-01</span>
          </button>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl liquid-card">
        
        <!-- Pestañas de Estado con Contador Dinámico -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            (click)="filtro = 'TODOS'"
            [class]="filtro === 'TODOS' ? 'px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition cursor-pointer' : 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition cursor-pointer'"
          >
            Todos ({{ alojamientos.length }})
          </button>

          <button
            type="button"
            (click)="filtro = 'PENDIENTES'"
            [class]="filtro === 'PENDIENTES' ? 'px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-500/25 transition cursor-pointer' : 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-amber-500 text-xs font-medium transition cursor-pointer'"
          >
            Pendientes ({{ conteoPendientes }})
          </button>

          <button
            type="button"
            (click)="filtro = 'EN_REVISION'"
            [class]="filtro === 'EN_REVISION' ? 'px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition cursor-pointer' : 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-blue-500 text-xs font-medium transition cursor-pointer'"
          >
            En Revisión ({{ conteoEnRevision }})
          </button>

          <button
            type="button"
            (click)="filtro = 'PUBLICADOS'"
            [class]="filtro === 'PUBLICADOS' ? 'px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/25 transition cursor-pointer' : 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-emerald-500 text-xs font-medium transition cursor-pointer'"
          >
            Publicados ({{ conteoPublicados }})
          </button>

          <button
            type="button"
            (click)="filtro = 'OBSERVADOS'"
            [class]="filtro === 'OBSERVADOS' ? 'px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/25 transition cursor-pointer' : 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-rose-500 text-xs font-medium transition cursor-pointer'"
          >
            Observados ({{ conteoObservados }})
          </button>

          <button
            type="button"
            (click)="filtro = 'SUSPENDIDOS'"
            [class]="filtro === 'SUSPENDIDOS' ? 'px-3.5 py-1.5 rounded-xl bg-slate-700 text-white text-xs font-semibold shadow-md transition cursor-pointer' : 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition cursor-pointer'"
          >
            Suspendidos ({{ conteoSuspendidos }})
          </button>

          <button
            type="button"
            (click)="filtro = 'RECHAZADOS'"
            [class]="filtro === 'RECHAZADOS' ? 'px-3.5 py-1.5 rounded-xl bg-rose-700 text-white text-xs font-semibold shadow-md transition cursor-pointer' : 'px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-stone-400 hover:text-rose-500 text-xs font-medium transition cursor-pointer'"
          >
            Rechazados ({{ conteoRechazados }})
          </button>
        </div>

        <!-- Buscador con icono SVG -->
        <div class="relative w-full sm:w-72">
          <input
            type="text"
            [(ngModel)]="busqueda"
            placeholder="Buscar propiedad, ciudad o anfitrión..."
            class="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-xs text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

      </div>

      <!-- Estado Vacío -->
      <div *ngIf="alojamientosFiltrados.length === 0" class="p-12 text-center rounded-3xl liquid-card border-dashed border-slate-300 dark:border-stone-800 text-slate-500 dark:text-stone-400 text-xs">
        No hay alojamientos registrados en esta categoría de moderación.
      </div>

      <!-- Cuadrícula de Tarjetas de Alojamientos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div *ngFor="let a of alojamientosFiltrados; trackBy: trackById" class="p-5 rounded-3xl liquid-card liquid-card-hover space-y-4 flex flex-col justify-between">
          
          <div class="space-y-3">
            <!-- Header con Estado & Modalidad -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {{ a.departamento }} • {{ a.tipoPropiedad }}
                  </span>
                  
                  <!-- Badge Modalidad (Casa vs Hotel) -->
                  <span *ngIf="a.modalidad === 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1">
                    <svg class="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Hotel / Hostal (Multihabitación)</span>
                  </span>
                  <span *ngIf="a.modalidad !== 'HOTEL_HOSTAL'" class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                    <svg class="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Casa / Depto (Oferta Única)</span>
                  </span>
                </div>

                <h4 (click)="abrirInspeccion(a, 'general')" class="font-serif text-lg font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition">
                  {{ a.titulo }}
                </h4>
                <p class="text-xs text-slate-500 dark:text-stone-400 flex items-center gap-1.5 flex-wrap">
                  <span>Anfitrión: <strong class="text-slate-700 dark:text-stone-300">{{ a.anfitrion }}</strong></span>
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 text-[9px] font-bold border border-blue-200 dark:border-blue-800 shadow-sm" title="Anfitrión Verificado con C.I. y Documentos">
                    <svg class="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verificado</span>
                  </span>
                </p>
              </div>

              <!-- Badge de Estado -->
              <span [ngClass]="obtenerBadgeEstadoClase(a.estado)" class="px-2.5 py-1 rounded-xl text-[11px] font-bold border shrink-0">
                {{ obtenerEtiquetaEstado(a.estado) }}
              </span>
            </div>

            <!-- Imagen de Portada con Lightbox Directo -->
            <div class="h-48 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-stone-800 group cursor-pointer"
                 (click)="abrirFotoDirecta(a)">
              <img [src]="a.imagen" [alt]="a.titulo" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div class="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-black/85 text-white text-xs font-bold font-mono border border-white/10 shadow-lg">
                {{ a.precioNoche }} BOB / noche
              </div>
              <div class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/75 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>Ampliar Foto</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
              {{ a.descripcion }}
            </p>

            <!-- Banner de Observación si aplica -->
            <div *ngIf="a.motivoObservacionRechazo" class="banner-observacion p-3 rounded-xl border text-[11px] space-y-1 shadow-sm">
              <div class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Alerta de Moderación:</span>
              </div>
              <p class="leading-relaxed pl-5 font-medium">{{ a.motivoObservacionRechazo }}</p>
            </div>

            <!-- Ficha de Modalidad, Capacidad y Horarios -->
            <div class="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-stone-400 pt-2 border-t border-slate-200 dark:border-stone-800">
              <div class="flex items-center justify-between">
                <button
                  *ngIf="a.modalidad === 'HOTEL_HOSTAL'"
                  type="button"
                  (click)="abrirInspeccion(a, 'habitaciones')"
                  class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{{ a.unidades?.length || 1 }} Tipos de habitación configurados — Auditar fotos</span>
                  <span class="text-xs">→</span>
                </button>
                <div *ngIf="a.modalidad !== 'HOTEL_HOSTAL'" class="flex items-center gap-3">
                  <span class="inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{{ a.capacidad }} Huéspedes</span>
                  </span>
                  <span>•</span>
                  <span class="inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{{ a.habitaciones }} Dormitorios</span>
                  </span>
                </div>
                <span class="font-mono text-[11px]">{{ a.fechaRegistro | date:'mediumDate' }}</span>
              </div>
            </div>

          </div>

          <!-- Botones de Acción de Moderación -->
          <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-stone-800">
            <button
              type="button"
              (click)="abrirInspeccion(a, 'general')"
              class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-200 font-semibold text-xs border border-slate-300 dark:border-stone-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Inspeccionar</span>
            </button>

            <div class="flex items-center gap-2">
              <!-- Botón Observar -->
              <button
                type="button"
                (click)="observar.emit(a)"
                class="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-semibold transition cursor-pointer"
              >
                Observar
              </button>

              <!-- Botón Rechazar -->
              <button
                type="button"
                (click)="rechazar.emit(a)"
                class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-semibold transition cursor-pointer"
              >
                Rechazar
              </button>

              <!-- Botón Aprobar -->
              <button
                *ngIf="a.estado !== 'PUBLICADO'"
                type="button"
                (click)="aprobar.emit(a.id)"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/25 transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Aprobar</span>
              </button>

              <!-- Botón Pausar/Suspender -->
              <button
                *ngIf="a.estado === 'PUBLICADO'"
                type="button"
                (click)="suspender.emit(a.id)"
                class="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer"
              >
                Pausar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class AlojamientosComponent {
  @Input() alojamientos: SolicitudAlojamiento[] = [];
  @Input() cargando: boolean = false;

  @Output() inspeccionar = new EventEmitter<{ alojamiento: SolicitudAlojamiento; subTab: 'general' | 'habitaciones' | 'resenas' }>();
  @Output() aprobar = new EventEmitter<string>();
  @Output() observar = new EventEmitter<SolicitudAlojamiento>();
  @Output() rechazar = new EventEmitter<SolicitudAlojamiento>();
  @Output() suspender = new EventEmitter<string>();
  @Output() onSincronizar = new EventEmitter<void>();
  @Output() onAbrirFoto = new EventEmitter<{ url: string; index: number; fotos: string[]; titulo?: string; alerta?: string }>();

  filtro: FiltroAlojamientos = 'TODOS';
  busqueda: string = '';

  get conteoPendientes(): number {
    return this.alojamientos.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_REVISION').length;
  }

  get conteoEnRevision(): number {
    return this.alojamientos.filter(a => a.estado === 'EN_REVISION').length;
  }

  get conteoPublicados(): number {
    return this.alojamientos.filter(a => a.estado === 'PUBLICADO').length;
  }

  get conteoObservados(): number {
    return this.alojamientos.filter(a => a.estado === 'OBSERVADO').length;
  }

  get conteoSuspendidos(): number {
    return this.alojamientos.filter(a => a.estado === 'SUSPENDIDO').length;
  }

  get conteoRechazados(): number {
    return this.alojamientos.filter(a => a.estado === 'RECHAZADO').length;
  }

  get alojamientosFiltrados(): SolicitudAlojamiento[] {
    return this.alojamientos.filter(a => {
      let matchEstado = true;
      if (this.filtro === 'PENDIENTES' || this.filtro === 'PENDIENTE') {
        matchEstado = a.estado === 'PENDIENTE';
      } else if (this.filtro === 'EN_REVISION') {
        matchEstado = a.estado === 'EN_REVISION';
      } else if (this.filtro === 'PUBLICADOS' || this.filtro === 'PUBLICADO') {
        matchEstado = a.estado === 'PUBLICADO';
      } else if (this.filtro === 'OBSERVADOS' || this.filtro === 'OBSERVADO') {
        matchEstado = a.estado === 'OBSERVADO';
      } else if (this.filtro === 'SUSPENDIDOS' || this.filtro === 'SUSPENDIDO') {
        matchEstado = a.estado === 'SUSPENDIDO';
      } else if (this.filtro === 'RECHAZADOS' || this.filtro === 'RECHAZADO') {
        matchEstado = a.estado === 'RECHAZADO';
      }

      const q = this.busqueda.toLowerCase().trim();
      const matchBusqueda = !q ||
        a.titulo.toLowerCase().includes(q) ||
        a.ciudad.toLowerCase().includes(q) ||
        a.departamento.toLowerCase().includes(q) ||
        a.anfitrion.toLowerCase().includes(q);

      return matchEstado && matchBusqueda;
    });
  }

  abrirInspeccion(a: SolicitudAlojamiento, subTab: 'general' | 'habitaciones' | 'resenas' = 'general') {
    this.inspeccionar.emit({ alojamiento: a, subTab });
  }

  abrirFotoDirecta(a: SolicitudAlojamiento) {
    const fotos = a.fotos && a.fotos.length > 0 ? a.fotos : [a.imagen];
    this.onAbrirFoto.emit({
      url: a.imagen,
      index: 0,
      fotos,
      titulo: a.titulo,
      alerta: a.estado === 'OBSERVADO' ? a.motivoObservacionRechazo : undefined
    });
  }

  obtenerEtiquetaEstado(estado: string): string {
    switch (estado) {
      case 'PUBLICADO': return 'Publicado';
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_REVISION': return 'En Revisión';
      case 'OBSERVADO': return 'Observado';
      case 'SUSPENDIDO': return 'Suspendido';
      case 'RECHAZADO': return 'Rechazado';
      default: return estado;
    }
  }

  obtenerBadgeEstadoClase(estado: string): string {
    switch (estado) {
      case 'PUBLICADO': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'PENDIENTE': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'EN_REVISION': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'OBSERVADO': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'SUSPENDIDO': return 'bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 border-slate-300 dark:border-stone-700';
      case 'RECHAZADO': return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-400 dark:border-rose-700';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  }

  trackById(index: number, item: SolicitudAlojamiento): string {
    return item.id;
  }
}
