import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudAlojamiento } from '../../core/types/admin.types';

@Component({
  selector: 'app-rechazo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="alojamiento"
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
         (click)="cerrar()">
      <div class="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-2xl space-y-5"
           (click)="$event.stopPropagation()">
        
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-slate-900 dark:text-white">Rechazar Publicación</h3>
              <p class="text-xs text-slate-500 dark:text-stone-400">
                La propiedad no será publicada en el catálogo oficial de Aloja-Te.
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

        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">
            Motivo Formal de Rechazo:
          </label>
          <textarea
            [(ngModel)]="motivo"
            rows="3"
            placeholder="Ingresa la causa legal o técnica de rechazo definitivo..."
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 text-xs text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <button type="button"
                  (click)="cerrar()"
                  class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-stone-800 hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer">
            Cancelar
          </button>
          <button type="button"
                  [disabled]="!motivo.trim()"
                  (click)="confirmar()"
                  class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition cursor-pointer inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Confirmar Rechazo</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class RechazoModalComponent {
  @Input() alojamiento: SolicitudAlojamiento | null = null;
  @Output() onConfirmar = new EventEmitter<{ id: string; motivo: string }>();
  @Output() onClose = new EventEmitter<void>();

  motivo: string = '';

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
