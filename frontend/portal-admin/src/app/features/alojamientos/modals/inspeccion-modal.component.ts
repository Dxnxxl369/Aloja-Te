import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudAlojamiento, UnidadAdmin, ValoracionAdmin } from '../../../core/types/admin.types';

@Component({
  selector: 'app-inspeccion-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="alojamiento"
         class="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto animate-fade-in"
         (click)="cerrar.emit()">
      <div class="relative max-w-5xl w-full p-6 sm:p-8 rounded-3xl liquid-card border border-slate-200 dark:border-stone-800 shadow-2xl space-y-6 my-auto bg-white dark:bg-stone-900"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-stone-800 pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    [ngClass]="obtenerClaseEstado(alojamiento.estado)">
                {{ alojamiento.estado }}
              </span>
              <span *ngIf="alojamiento.modalidad === 'HOTEL_HOSTAL'"
                    class="px-2.5 py-0.5 rounded-md text-[10px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/30 inline-flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Hotel ({{ alojamiento.unidades?.length || 0 }} habitaciones)</span>
              </span>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {{ alojamiento.titulo }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-stone-400">
              {{ alojamiento.ciudad }}, {{ alojamiento.departamento }} • Anfitrión: <strong class="text-slate-700 dark:text-stone-300">{{ alojamiento.anfitrion }}</strong>
            </p>
          </div>

          <button type="button"
                  (click)="cerrar.emit()"
                  class="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-slate-200 dark:border-stone-700 text-slate-500 dark:text-stone-400 font-bold text-sm flex items-center justify-center cursor-pointer transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Banner de Observación si aplica -->
        <div *ngIf="alojamiento.motivoObservacionRechazo"
             class="banner-observacion p-4 rounded-2xl border space-y-1.5 text-xs shadow-sm">
          <div class="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
            <svg class="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Motivo de Observación / Auditoría</span>
          </div>
          <p class="leading-relaxed pl-6 font-medium">
            {{ alojamiento.motivoObservacionRechazo }}
          </p>
        </div>

        <!-- Subtabs Navigation -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-stone-800 pb-2">
          <button type="button"
                  (click)="subTab = 'general'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  [ngClass]="subTab === 'general' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800'">
            Información General
          </button>

          <button type="button"
                  *ngIf="alojamiento.unidades && alojamiento.unidades.length > 0"
                  (click)="subTab = 'habitaciones'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2"
                  [ngClass]="subTab === 'habitaciones' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800'">
            <span>Habitaciones ({{ alojamiento.unidades.length }})</span>
            <span *ngIf="tieneHabitacionesObservadas" class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>

          <button type="button"
                  (click)="subTab = 'resenas'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  [ngClass]="subTab === 'resenas' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800'">
            Reseñas & Auditoría NLP
          </button>
        </div>

        <!-- SUBTAB 1: GENERAL -->
        <div *ngIf="subTab === 'general'" class="space-y-5 animate-fade-in">
          <!-- Galería de Fotos del Alojamiento -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Fotografías de la Propiedad</span>
              <span class="text-[11px] text-slate-400">Clic en cualquier imagen para abrir el visor en pantalla completa</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div *ngFor="let f of fotosAlojamiento; let idx = index"
                   (click)="abrirFoto.emit({ url: f, index: idx, fotos: fotosAlojamiento, titulo: alojamiento.titulo, alerta: alojamiento.estado === 'OBSERVADO' ? alojamiento.motivoObservacionRechazo : undefined })"
                   class="group relative h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-stone-800 cursor-pointer shadow-sm hover:border-blue-500 transition">
                <img [src]="f" [alt]="alojamiento.titulo" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition"></div>
                <span class="absolute bottom-1.5 left-2 text-[10px] text-white/90 font-mono font-bold">#{{ idx + 1 }}</span>
              </div>
            </div>
          </div>

          <!-- Datos Clave -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl liquid-card border border-slate-200 dark:border-stone-800 text-xs">
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Precio por Noche</span>
              <strong class="text-slate-900 dark:text-white font-mono text-sm">{{ alojamiento.precioNoche }} BOB</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Capacidad</span>
              <strong class="text-slate-900 dark:text-white">{{ alojamiento.capacidad }} personas</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Check-In / Out</span>
              <strong class="text-slate-900 dark:text-white">{{ alojamiento.horarioEntrada || '14:00' }} / {{ alojamiento.horarioSalida || '11:00' }}</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Tipo de Propiedad</span>
              <strong class="text-slate-900 dark:text-white">{{ alojamiento.tipoPropiedad }}</strong>
            </div>
          </div>

          <!-- Descripción y Servicios -->
          <div class="space-y-3 text-xs">
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Descripción</span>
              <p class="text-slate-700 dark:text-stone-300 leading-relaxed">{{ alojamiento.descripcion }}</p>
            </div>
            <div *ngIf="alojamiento.servicios && alojamiento.servicios.length > 0">
              <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">Servicios Incluidos</span>
              <div class="flex flex-wrap gap-1.5">
                <span *ngFor="let s of alojamiento.servicios" class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 text-[11px] font-medium border border-slate-200 dark:border-stone-700">
                  {{ s }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- SUBTAB 2: HABITACIONES (EXPLORACIÓN DE HABITACIONES N) -->
        <div *ngIf="subTab === 'habitaciones'" class="space-y-4 animate-fade-in">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-serif font-bold text-base text-slate-900 dark:text-white">
                Habitaciones y Unidades Registradas
              </h4>
              <p class="text-xs text-slate-500 dark:text-stone-400">
                Selecciona una habitación para inspeccionar su galería completa de fotos y estado
              </p>
            </div>
            <span class="text-xs text-slate-400 font-mono">
              {{ alojamiento.unidades?.length || 0 }} unidades
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let u of alojamiento.unidades"
                 class="p-5 rounded-2xl liquid-card border transition space-y-3.5 shadow-sm"
                 [ngClass]="esHabitacionObservada(u) ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-200 dark:border-stone-800'">
              
              <!-- Título & Estado -->
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h5 class="font-serif font-bold text-sm text-slate-900 dark:text-white">
                    {{ u.nombre }}
                  </h5>
                  <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {{ u.precioNoche }} BOB / noche
                  </span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                      [ngClass]="esHabitacionObservada(u) ? 'badge-observado' : (u.estado === 'MANTENIMIENTO' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/50' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/50')">
                  {{ esHabitacionObservada(u) ? 'Observada' : (u.estado === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Disponible') }}
                </span>
              </div>

              <!-- Alerta específica si es observada (ej: habitación doble superior foto 2) -->
              <div *ngIf="esHabitacionObservada(u)" class="banner-alerta-ia p-3 rounded-xl border text-xs space-y-1 shadow-sm">
                <div class="flex items-center gap-1.5 font-bold">
                  <svg class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Observación IA</span>
                </div>
                <p class="leading-relaxed pl-5 font-medium">{{ obtenerDetalleObservacionHabitacion(u) }}</p>
              </div>

              <!-- Miniatura de fotos de la habitación -->
              <div *ngIf="obtenerFotosHabitacion(u).length > 0" class="flex items-center gap-2 overflow-x-auto py-1">
                <div *ngFor="let f of obtenerFotosHabitacion(u); let fIdx = index"
                     (click)="abrirFoto.emit({ url: f, index: fIdx, fotos: obtenerFotosHabitacion(u), titulo: u.nombre, alerta: esFotoObservada(u, fIdx) ? 'Foto ' + (fIdx + 1) + ' observada por Vision IA' : undefined })"
                     class="relative w-20 h-16 rounded-xl overflow-hidden border shrink-0 cursor-pointer hover:border-blue-500 transition"
                     [ngClass]="esFotoObservada(u, fIdx) ? 'border-2 border-rose-500 ring-2 ring-rose-500/40' : 'border-slate-200 dark:border-stone-700'">
                  <img [src]="f" [alt]="u.nombre" class="w-full h-full object-cover" />
                  <span *ngIf="esFotoObservada(u, fIdx)" class="absolute top-0 right-0 w-4 h-4 bg-rose-600 rounded-bl text-[9px] text-white flex items-center justify-center font-bold">!</span>
                </div>
              </div>

              <!-- Ficha rápida con SVGs -->
              <div class="flex items-center gap-4 text-[11px] text-slate-500 dark:text-stone-400">
                <span class="inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ u.capacidadHuespedes }} personas</span>
                </span>
                <span class="inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{{ u.cantidadCamas }} camas</span>
                </span>
                <span class="inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ u.cantidadBanos }} baños</span>
                </span>
              </div>

              <!-- Botón Principal: Entrar a la habitación -->
              <button type="button"
                      (click)="abrirHabitacionDetalle.emit(u)"
                      class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-500/25 flex items-center justify-center gap-2">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span class="text-white">Inspeccionar Habitación y Fotos</span>
              </button>
            </div>
          </div>
        </div>

        <!-- SUBTAB 3: RESEÑAS -->
        <div *ngIf="subTab === 'resenas'" class="space-y-4 animate-fade-in">
          <div *ngIf="resenasAlojamiento.length === 0" class="py-12 text-center text-xs text-slate-400">
            No se encontraron reseñas registradas para este alojamiento.
          </div>
          <div *ngIf="resenasAlojamiento.length > 0" class="space-y-3">
            <div *ngFor="let r of resenasAlojamiento" class="p-4 rounded-2xl liquid-card border border-slate-200 dark:border-stone-800 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <div>
                  <strong class="text-slate-900 dark:text-white">{{ r.nombreUsuario }}</strong>
                  <span *ngIf="r.nombreUnidad" class="text-slate-400 ml-1.5 font-medium">({{ r.nombreUnidad }})</span>
                </div>
                <div class="flex items-center gap-1 text-amber-500 font-bold">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{{ r.puntuacionGeneral }}</span>
                </div>
              </div>
              <p class="text-slate-700 dark:text-stone-300 leading-relaxed">{{ r.comentario }}</p>
              <div *ngIf="r.sentimientoNlp" class="flex items-center gap-2 pt-1 text-[10px]">
                <span class="px-2 py-0.5 rounded-full font-bold uppercase border"
                      [ngClass]="r.sentimientoNlp === 'POSITIVO' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : (r.sentimientoNlp === 'NEGATIVO' ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' : 'bg-slate-200 text-slate-600 border-slate-300')">
                  NLP: {{ r.sentimientoNlp }}
                </span>
                <span *ngIf="r.topicoPredicho" class="text-slate-400">Tema: {{ r.topicoPredicho }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-stone-800 pt-4">
          <button type="button"
                  (click)="cerrar.emit()"
                  class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-stone-700 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer">
            Cerrar
          </button>

          <div class="flex items-center gap-2">
            <!-- Observar -->
            <button type="button"
                    (click)="observar.emit(alojamiento)"
                    class="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Observar</span>
            </button>

            <!-- Rechazar -->
            <button type="button"
                    (click)="rechazar.emit(alojamiento)"
                    class="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Rechazar</span>
            </button>

            <!-- Aprobar / Publicar -->
            <button type="button"
                    *ngIf="alojamiento.estado !== 'PUBLICADO'"
                    (click)="aprobar.emit(alojamiento.id)"
                    class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition cursor-pointer inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Aprobar y Publicar</span>
            </button>

            <!-- Suspender (si ya está publicado) -->
            <button type="button"
                    *ngIf="alojamiento.estado === 'PUBLICADO'"
                    (click)="suspender.emit(alojamiento.id)"
                    class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer">
              Pausar / Suspender
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class InspeccionModalComponent {
  @Input() alojamiento: SolicitudAlojamiento | null = null;
  @Input() subTab: 'general' | 'habitaciones' | 'resenas' = 'general';
  @Input() resenasAlojamiento: ValoracionAdmin[] = [];

  @Output() cerrar = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<string>();
  @Output() observar = new EventEmitter<SolicitudAlojamiento>();
  @Output() rechazar = new EventEmitter<SolicitudAlojamiento>();
  @Output() suspender = new EventEmitter<string>();
  @Output() abrirHabitacionDetalle = new EventEmitter<UnidadAdmin>();
  @Output() abrirFoto = new EventEmitter<{ url: string; index: number; fotos: string[]; titulo?: string; alerta?: string }>();

  get fotosAlojamiento(): string[] {
    if (!this.alojamiento) return [];
    if (this.alojamiento.fotos && this.alojamiento.fotos.length > 0) return this.alojamiento.fotos;
    if (this.alojamiento.imagen) return [this.alojamiento.imagen];
    return [];
  }

  get tieneHabitacionesObservadas(): boolean {
    if (!this.alojamiento?.unidades) return false;
    return this.alojamiento.unidades.some(u => this.esHabitacionObservada(u));
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'PUBLICADO': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'OBSERVADO': return 'badge-observado';
      case 'RECHAZADO': return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'SUSPENDIDO': return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
      default: return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
  }

  esHabitacionObservada(u: UnidadAdmin): boolean {
    if (u.estado === 'OBSERVADO') return true;
    if (this.alojamiento?.motivoObservacionRechazo?.toLowerCase().includes(u.nombre.toLowerCase())) return true;
    return false;
  }

  obtenerDetalleObservacionHabitacion(u: UnidadAdmin): string {
    if (this.alojamiento?.motivoObservacionRechazo) {
      return this.alojamiento.motivoObservacionRechazo;
    }
    return 'Foto 2 observada por Vision IA: contenido no permitido / sospechoso detectado.';
  }

  obtenerFotosHabitacion(u: UnidadAdmin): string[] {
    if (u.fotos && u.fotos.length > 0) return u.fotos;
    return [];
  }

  esFotoObservada(u: UnidadAdmin, index: number): boolean {
    if (this.esHabitacionObservada(u) && index === 1) return true;
    return false;
  }
}
