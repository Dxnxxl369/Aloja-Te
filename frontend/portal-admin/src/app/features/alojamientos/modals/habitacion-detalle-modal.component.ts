import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnidadAdmin, SolicitudAlojamiento } from '../../../core/types/admin.types';

@Component({
  selector: 'app-habitacion-detalle-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="habitacion"
         class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto animate-fade-in"
         (click)="cerrar()">
      <div class="relative max-w-5xl w-full p-6 sm:p-8 rounded-3xl liquid-card border border-slate-200 dark:border-stone-800 shadow-2xl space-y-6 my-auto bg-white dark:bg-stone-900"
           (click)="$event.stopPropagation()">
        
        <!-- Header con Botón de Regreso -->
        <div class="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-stone-800 pb-4">
          <div class="space-y-1">
            <button type="button"
                    (click)="cerrar()"
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-blue-600 dark:text-blue-400 font-bold text-xs border border-slate-200 dark:border-stone-700 transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver a Habitaciones</span>
            </button>
            <h3 class="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white pt-1">
              {{ habitacion.nombre }}
            </h3>
            <p *ngIf="alojamiento" class="text-xs text-slate-500 dark:text-stone-400">
              Establecimiento: <strong class="text-slate-700 dark:text-stone-300">{{ alojamiento.titulo }}</strong> • Anfitrión: <strong class="text-slate-700 dark:text-stone-300">{{ alojamiento.anfitrion }}</strong>
            </p>
          </div>

          <!-- Badge de Estado de la Habitación -->
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="px-3 py-1 rounded-full text-xs font-bold border"
                  [ngClass]="obtenerClaseEstado(habitacion.estado)">
              {{ habitacion.estado === 'OBSERVADO' ? 'Observada' : (habitacion.estado === 'MANTENIMIENTO' ? 'En Mantenimiento' : 'Disponible') }}
            </span>
            <span class="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
              {{ habitacion.precioNoche }} BOB / noche
            </span>
          </div>
        </div>

        <!-- Banner de Observación de Auditoría IA si la habitación está observada -->
        <div *ngIf="esObservada(habitacion)"
             class="banner-alerta-ia p-4 rounded-2xl border space-y-1.5 shadow-sm">
          <div class="flex items-center gap-2 font-bold text-xs">
            <svg class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="uppercase tracking-wider">Alerta de Moderación Vision IA en esta Habitación</span>
          </div>
          <p class="text-xs leading-relaxed pl-6 font-medium">
            {{ obtenerMotivoObservacion(habitacion) }}
          </p>
        </div>

        <!-- Galería Completa de Fotografías de la Habitación -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-stone-300 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Fotografías de la Habitación ({{ obtenerFotos(habitacion).length }})</span>
            </h4>
            <span class="text-[11px] text-slate-400">Haz clic en cualquier foto para abrir el visor en pantalla completa</span>
          </div>

          <div *ngIf="obtenerFotos(habitacion).length === 0" class="p-8 text-center rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 text-xs text-slate-500">
            No hay fotografías registradas para esta habitación.
          </div>

          <div *ngIf="obtenerFotos(habitacion).length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div *ngFor="let url of obtenerFotos(habitacion); let idx = index"
                 class="group relative h-52 rounded-2xl overflow-hidden border transition cursor-pointer shadow-sm"
                 [ngClass]="esFotoObservada(habitacion, idx) ? 'border-2 border-rose-500 ring-2 ring-rose-500/40' : 'border-slate-200 dark:border-stone-800 hover:border-blue-500'"
                 (click)="abrirLightbox(url, idx)">
              
              <img [src]="url" [alt]="habitacion.nombre + ' - foto ' + (idx + 1)"
                   class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-95 transition-opacity"></div>

              <!-- Indicador de Foto Observada -->
              <div *ngIf="esFotoObservada(habitacion, idx)"
                   class="absolute top-2.5 left-2.5 px-3 py-1 rounded-xl bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Foto {{ idx + 1 }} Observada por IA</span>
              </div>

              <!-- Número de Foto -->
              <div class="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-semibold">
                Foto #{{ idx + 1 }}
              </div>

              <!-- Botón Lupa Hover -->
              <div class="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>Ampliar</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ficha Técnica de la Habitación con SVGs -->
        <div class="p-4 rounded-2xl liquid-card border border-slate-200 dark:border-stone-800 space-y-3">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Capacidad</span>
              <strong class="text-slate-900 dark:text-white inline-flex items-center gap-1.5 pt-0.5">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ habitacion.capacidadHuespedes }} personas</span>
              </strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Camas</span>
              <strong class="text-slate-900 dark:text-white inline-flex items-center gap-1.5 pt-0.5">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{{ habitacion.cantidadCamas }} camas</span>
              </strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Baños</span>
              <strong class="text-slate-900 dark:text-white inline-flex items-center gap-1.5 pt-0.5">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ habitacion.cantidadBanos }} baños</span>
              </strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Inventario</span>
              <strong class="text-slate-900 dark:text-white inline-flex items-center gap-1.5 pt-0.5">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>{{ habitacion.inventarioTotal }} unidades</span>
              </strong>
            </div>
          </div>

          <p *ngIf="habitacion.descripcion" class="text-xs text-slate-600 dark:text-stone-300 leading-relaxed pt-2 border-t border-slate-200 dark:border-stone-800">
            {{ habitacion.descripcion }}
          </p>
        </div>

        <!-- Botonera de Moderación para esta Habitación -->
        <div class="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-stone-800 flex-wrap">
          <button type="button"
                  (click)="cerrar()"
                  class="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-stone-700 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer">
            Cerrar Ficha
          </button>

          <div class="flex items-center gap-2">
            <button type="button"
                    (click)="observarHabitacion()"
                    class="py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Observar Habitación</span>
            </button>

            <button type="button"
                    (click)="alternarMantenimiento()"
                    class="py-2.5 px-4 rounded-xl text-xs font-bold border transition cursor-pointer inline-flex items-center gap-1.5"
                    [ngClass]="habitacion.estado === 'MANTENIMIENTO' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600' : 'bg-slate-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-200 border-slate-300 dark:border-stone-700'">
              <svg *ngIf="habitacion.estado === 'MANTENIMIENTO'" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg *ngIf="habitacion.estado !== 'MANTENIMIENTO'" class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>{{ habitacion.estado === 'MANTENIMIENTO' ? 'Activar Habitación' : 'Poner en Mantenimiento' }}</span>
            </button>

            <button type="button"
                    (click)="cambiarEstadoHabitacion('DISPONIBLE')"
                    class="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Aprobar / Habilitar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class HabitacionDetalleModalComponent {
  @Input() habitacion: UnidadAdmin | null = null;
  @Input() alojamiento: SolicitudAlojamiento | null = null;

  @Output() onClose = new EventEmitter<void>();
  @Output() onCerrar = new EventEmitter<void>();
  @Output() onToggleEstado = new EventEmitter<UnidadAdmin>();
  @Output() onObservarHabitacion = new EventEmitter<UnidadAdmin>();
  @Output() abrirFoto = new EventEmitter<{ url: string; index: number; galeria: string[]; titulo?: string; alertaObservacion?: string }>();

  cerrar() {
    this.onClose.emit();
    this.onCerrar.emit();
  }

  obtenerFotos(u: UnidadAdmin): string[] {
    if (u.fotos && u.fotos.length > 0) return u.fotos;
    if (u.fotografias && u.fotografias.length > 0) {
      return u.fotografias.map(f => typeof f === 'string' ? f : f.url).filter(Boolean);
    }
    return [];
  }

  esObservada(u: UnidadAdmin): boolean {
    if (u.estado === 'OBSERVADO') return true;
    if (u.motivoObservacion) return true;
    if (this.alojamiento && (this.alojamiento.motivoObservacionRechazo || this.alojamiento.motivoRechazo)) {
      const mot = (this.alojamiento.motivoObservacionRechazo || this.alojamiento.motivoRechazo || '').toLowerCase();
      if (mot.includes(u.nombre.toLowerCase()) || (mot.includes('habitación doble') && u.nombre.toLowerCase().includes('doble'))) {
        return true;
      }
    }
    return false;
  }

  obtenerMotivoObservacion(u: UnidadAdmin): string {
    if (u.motivoObservacion) return u.motivoObservacion;
    if (this.alojamiento && (this.alojamiento.motivoObservacionRechazo || this.alojamiento.motivoRechazo)) {
      return this.alojamiento.motivoObservacionRechazo || this.alojamiento.motivoRechazo || '';
    }
    return 'Foto 2 observada por Vision IA: contenido no permitido / sospechoso detectado.';
  }

  esFotoObservada(u: UnidadAdmin, index: number): boolean {
    if (u.fotoObservadaIndex !== undefined && u.fotoObservadaIndex === index) return true;
    const mot = this.obtenerMotivoObservacion(u).toLowerCase();
    if ((mot.includes('foto 2') || mot.includes('segunda foto') || mot.includes('foto 2 (contenido no permitido)')) && index === 1) {
      return true;
    }
    return false;
  }

  abrirLightbox(url: string, index: number) {
    if (!this.habitacion) return;
    const fotos = this.obtenerFotos(this.habitacion);
    const alerta = this.esFotoObservada(this.habitacion, index)
      ? 'Foto 2 observada por el motor de visión IA: contenido dudoso o no permitido detectado.'
      : undefined;
    this.abrirFoto.emit({
      url,
      index,
      galeria: fotos,
      titulo: `${this.habitacion.nombre} — Foto #${index + 1}`,
      alertaObservacion: alerta
    });
  }

  obtenerClaseEstado(estado: string): string {
    if (estado === 'OBSERVADO') return 'badge-observado';
    if (estado === 'MANTENIMIENTO') return 'bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 border-slate-300 dark:border-stone-700';
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  }

  alternarMantenimiento() {
    if (!this.habitacion) return;
    this.onToggleEstado.emit(this.habitacion);
  }

  observarHabitacion() {
    if (!this.habitacion) return;
    this.onObservarHabitacion.emit(this.habitacion);
  }

  cambiarEstadoHabitacion(nuevoEstado: string) {
    if (!this.habitacion) return;
    this.habitacion.estado = nuevoEstado;
    this.onToggleEstado.emit(this.habitacion);
  }
}
