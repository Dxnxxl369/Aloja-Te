import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudAlojamiento } from '../../core/types/admin.types';

@Component({
  selector: 'app-observacion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="alojamiento"
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
         (click)="cerrar()">
      <div class="max-w-lg w-full p-6 rounded-3xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-2xl space-y-5"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-slate-900 dark:text-white">Observar Publicación</h3>
              <p class="text-xs text-slate-500 dark:text-stone-400">
                Se notificará al anfitrión para que subsane los motivos señalados.
              </p>
            </div>
          </div>
          <button type="button" (click)="cerrar()" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-stone-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 text-xs">
          <strong class="text-slate-800 dark:text-stone-200 font-semibold">{{ alojamiento.titulo }}</strong>
          <span class="text-slate-500 dark:text-stone-400 block mt-0.5">Anfitrión: {{ alojamiento.anfitrion }}</span>
        </div>

        <!-- Opciones rápidas de motivo -->
        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">
            Motivos Frecuentes:
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button type="button"
                    *ngFor="let m of motivosPredefinidos"
                    (click)="motivo = m"
                    class="py-2 px-2.5 rounded-xl text-left border transition text-[11px]"
                    [ngClass]="motivo === m ? 'bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-200 font-bold' : 'bg-slate-50 dark:bg-stone-950 border-slate-200 dark:border-stone-800 text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800'">
              {{ m }}
            </button>
          </div>
        </div>

        <!-- Campo de texto detallado -->
        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">
            Detalle Técnico de la Observación:
          </label>
          <textarea
            [(ngModel)]="motivo"
            rows="3"
            placeholder="Especifica el motivo de la observación, habitación o fotografía observada..."
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 text-xs text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          ></textarea>
        </div>

        <!-- Acciones -->
        <div class="flex items-center justify-end gap-2.5 pt-2">
          <button type="button"
                  (click)="cerrar()"
                  class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-stone-800 hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer">
            Cancelar
          </button>
          <button type="button"
                  [disabled]="!motivo.trim()"
                  (click)="confirmar()"
                  class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Confirmar Observación</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class ObservacionModalComponent {
  @Input() alojamiento: SolicitudAlojamiento | null = null;
  @Output() onConfirmar = new EventEmitter<{ id: string; motivo: string }>();
  @Output() onClose = new EventEmitter<void>();

  motivo: string = '';

  motivosPredefinidos = [
    'Contenido no permitido en fotografías',
    'Fotografías borrosas o de baja resolución',
    'Falta licencia turística o registro municipal',
    'Discrepancia entre tipología de habitación y fotos'
  ];

  cerrar() {
    this.motivo = '';
    this.onClose.emit();
  }

  confirmar() {
    if (!this.alojamiento || !this.motivo.trim()) return;
    this.onConfirmar.emit({ id: this.alojamiento.id, motivo: this.motivo.trim() });
    this.cerrar();
  }
}
