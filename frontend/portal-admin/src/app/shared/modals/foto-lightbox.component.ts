import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-foto-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Backdrop Pantalla Completa -->
    <div
      *ngIf="activo"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in select-none cursor-pointer"
      (click)="cerrar()"
    >
      <div class="relative w-full max-w-6xl flex flex-col items-center space-y-4 my-auto cursor-default" (click)="$event.stopPropagation()">
        
        <!-- Header Superior del Lightbox -->
        <div class="flex items-center justify-between z-20 w-full px-5 py-3 rounded-2xl bg-white/10 dark:bg-stone-900/80 backdrop-blur-md border border-white/15 shadow-2xl">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span class="text-sm sm:text-base font-bold text-white block leading-tight truncate max-w-md sm:max-w-xl">
                {{ titulo || 'Fotografía de Inspección Técnica' }}
              </span>
              <div class="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span class="font-mono">Foto {{ indexInterno + 1 }} de {{ galeriaSegura.length }}</span>
                <span>•</span>
                <span class="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white">[← / → Flechas]</span>
                <span class="px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white">[Esc Salir]</span>
              </div>
            </div>
          </div>

          <!-- Botón Cerrar (Esc) -->
          <button
            type="button"
            (click)="cerrar()"
            class="px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition border border-white/25 flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
            title="Cerrar visor (Esc)"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Cerrar (Esc)</span>
          </button>
        </div>

        <!-- Banner de Alerta si la fotografía está observada por IA -->
        <div *ngIf="alertaObservacion"
             class="w-full px-4 py-3 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-200 text-xs flex items-center gap-3 shadow-xl backdrop-blur-md animate-fade-in">
          <div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md">
            !
          </div>
          <div class="flex-1">
            <strong class="font-bold text-rose-300 uppercase tracking-wide block">Alerta de Moderación Vision IA:</strong>
            <span class="text-white/90 text-xs leading-relaxed">{{ alertaObservacion }}</span>
          </div>
        </div>

        <!-- Área Central con Imagen y Flechas Flotantes -->
        <div class="relative flex-1 flex items-center justify-center w-full min-h-[50vh] max-h-[72vh] my-2" (click)="$event.stopPropagation()">
          <!-- Flecha Anterior -->
          <button
            *ngIf="galeriaSegura.length > 1"
            type="button"
            (click)="anterior(); $event.stopPropagation()"
            class="absolute left-2 sm:left-4 z-20 p-3.5 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600 text-white transition backdrop-blur-md border border-white/20 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
            title="Foto anterior (←)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Imagen Principal -->
          <img
            [src]="fotoActual"
            [alt]="titulo || 'Fotografía ampliada'"
            class="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/20 select-none animate-fade-in"
          />

          <!-- Flecha Siguiente -->
          <button
            *ngIf="galeriaSegura.length > 1"
            type="button"
            (click)="siguiente(); $event.stopPropagation()"
            class="absolute right-2 sm:right-4 z-20 p-3.5 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600 text-white transition backdrop-blur-md border border-white/20 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
            title="Foto siguiente (→)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Tira de Miniaturas Inferior -->
        <div *ngIf="galeriaSegura.length > 1"
             class="flex items-center justify-center gap-2 z-20 max-w-5xl w-full mx-auto overflow-x-auto py-2.5 px-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md"
             (click)="$event.stopPropagation()">
          <button
            *ngFor="let f of galeriaSegura; let i = index"
            type="button"
            (click)="seleccionarIndice(i); $event.stopPropagation()"
            [class]="i === indexInterno ? 'w-14 h-14 rounded-xl overflow-hidden ring-2 ring-blue-500 shrink-0 shadow-lg scale-105 transition-all border border-blue-400' : 'w-14 h-14 rounded-xl overflow-hidden opacity-50 hover:opacity-100 shrink-0 transition-all border border-white/20'"
          >
            <img [src]="f" [alt]="'Miniatura ' + (i + 1)" class="w-full h-full object-cover" />
          </button>
        </div>

      </div>
    </div>
  `
})
export class FotoLightboxComponent implements OnChanges {
  @Input() activo: boolean = false;
  @Input() urlActual: string = '';
  @Input() indiceActual: number = 0;
  @Input() galeria: string[] = [];
  @Input() titulo?: string;
  @Input() alertaObservacion?: string;

  @Output() onClose = new EventEmitter<void>();
  @Output() onCerrar = new EventEmitter<void>();
  @Output() onCambiarIndice = new EventEmitter<number>();

  indexInterno: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['indiceActual'] !== undefined) {
      this.indexInterno = this.indiceActual || 0;
    }
  }

  get galeriaSegura(): string[] {
    if (this.galeria && this.galeria.length > 0) return this.galeria;
    if (this.urlActual) return [this.urlActual];
    return [];
  }

  get fotoActual(): string {
    const list = this.galeriaSegura;
    if (list.length === 0) return this.urlActual;
    return list[this.indexInterno] || list[0] || this.urlActual;
  }

  @HostListener('window:keydown', ['$event'])
  manejarTeclado(event: KeyboardEvent) {
    if (!this.activo) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.cerrar();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      this.siguiente();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      this.anterior();
    }
  }

  cerrar() {
    this.onClose.emit();
    this.onCerrar.emit();
  }

  siguiente() {
    if (this.galeriaSegura.length <= 1) return;
    this.indexInterno = (this.indexInterno + 1) % this.galeriaSegura.length;
    this.onCambiarIndice.emit(this.indexInterno);
  }

  anterior() {
    if (this.galeriaSegura.length <= 1) return;
    this.indexInterno = (this.indexInterno - 1 + this.galeriaSegura.length) % this.galeriaSegura.length;
    this.onCambiarIndice.emit(this.indexInterno);
  }

  seleccionarIndice(idx: number) {
    this.indexInterno = idx;
    this.onCambiarIndice.emit(idx);
  }
}
