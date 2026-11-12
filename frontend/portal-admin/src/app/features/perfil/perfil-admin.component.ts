import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioAdmin } from '../../core/types/admin.types';

const API_GATEWAY_URL =
  (typeof window !== 'undefined' &&
    ((window as any).__ENV__?.API_GATEWAY_URL ||
      (window as any).VITE_API_GATEWAY_URL ||
      (window as any).API_GATEWAY_URL)) ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://aloja-te-admin.duckdns.org');

@Component({
  selector: 'app-perfil-admin-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Tarjeta Principal de Cabecera del Perfil -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-5">
            <div class="relative">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-serif font-black text-2xl shadow-xl shadow-blue-500/25">
                {{ getIniciales() }}
              </div>
              <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-3 border-white dark:border-stone-900 flex items-center justify-center text-[10px] text-white font-bold" title="Cuenta Activa">
                ✓
              </span>
            </div>

            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  {{ usuario?.nombre || 'Admin' }} {{ usuario?.apellido || 'Aloja-Te' }}
                </h2>
                <span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                  {{ usuario?.rolNombre || 'ADMINISTRADOR' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-stone-400 mt-1">
                {{ usuario?.tipoCuenta || 'ADMIN_GLOBAL' }} • Dirección de Auditoría & Control Institucional
              </p>              
            </div>
          </div>

          <div class="flex flex-col sm:items-end gap-2 shrink-0">
            
            <span class="text-[11px] text-slate-400">
              Registrado: {{ formatearFecha(usuario?.fechaRegistro) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Toast de Confirmación -->
      <div *ngIf="mensajeToast" class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
        <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ mensajeToast }}</span>
      </div>

      <!-- Formulario de Datos Reales de la Entidad Usuario -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Bloque 1: Identificación & Documentación Oficial (Solo lectura oficial) -->
        <div class="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-stone-800">
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-sm">
              🪪
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">Identificación Oficial Boliviana</h3>
              <p class="text-[11px] text-slate-400">Datos registrados en el Padrón Nacional</p>
            </div>
          </div>

          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block font-semibold text-slate-500 dark:text-stone-400 mb-1">Nombre Oficial</label>
              <input
                type="text"
                [value]="usuario?.nombre"
                readonly
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-500 dark:text-stone-400 mb-1">Apellidos</label>
              <input
                type="text"
                [value]="usuario?.apellido"
                readonly
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 font-medium cursor-not-allowed"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-500 dark:text-stone-400 mb-1">Cédula de Identidad (CI)</label>
                <input
                  type="text"
                  [value]="usuario?.ci"
                  readonly
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 font-mono font-bold cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-500 dark:text-stone-400 mb-1">Expedido en</label>
                <input
                  type="text"
                  [value]="usuario?.ciExpedido"
                  readonly
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-500 dark:text-stone-400 mb-1">Correo Electrónico Institucional</label>
              <input
                type="text"
                [value]="usuario?.email"
                readonly
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Bloque 2: Contacto & Domicilio Radicatoria (Editables) -->
        <div class="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-stone-800">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-sm">
              📱
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">Datos de Contacto Directo</h3>
              <p class="text-[11px] text-slate-400">Canales para alertas operativas y verificación</p>
            </div>
          </div>

          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-stone-300 mb-1">Teléfono Móvil / Celular</label>
              <input
                type="text"
                [(ngModel)]="formTelefono"
                placeholder="+591 70000001"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-slate-300 dark:border-stone-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-stone-300 mb-1">Teléfono de Emergencia</label>
              <input
                type="text"
                [(ngModel)]="formTelefonoEmergencia"
                placeholder="Teléfono alternativo de contingencia"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-slate-300 dark:border-stone-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-stone-300 mb-1">Dirección Domiciliaria</label>
              <input
                type="text"
                [(ngModel)]="formDireccionDomicilio"
                placeholder="Av. Principal, Edificio Torre Empresarial"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-slate-300 dark:border-stone-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-stone-300 mb-1">Departamento de Radicatoria</label>
              <select
                [(ngModel)]="formDepartamentoRadicatoria"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-slate-300 dark:border-stone-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="La Paz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Tarija">Tarija</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Bloque 3: Tesorería y Cuenta Bancaria de la Plataforma (Editable) -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm space-y-4">
        <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-stone-800">
          <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-sm">
            🏦
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Cuenta Bancaria Oficial de la Plataforma</h3>
            <p class="text-[11px] text-slate-400">Utilizada para transferencias interbancarias y custodia de reservas</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-stone-300 mb-1">Entidad Bancaria Nacional</label>
            <select
              [(ngModel)]="formBancoNombre"
              class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-slate-300 dark:border-stone-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Banco Nacional de Bolivia (BNB)">Banco Nacional de Bolivia (BNB)</option>
              <option value="Banco Mercantil Santa Cruz (BMSC)">Banco Mercantil Santa Cruz (BMSC)</option>
              <option value="Banco Unión S.A.">Banco Unión S.A.</option>
              <option value="Banco BISA S.A.">Banco BISA S.A.</option>
              <option value="Banco Ganadero S.A.">Banco Ganadero S.A.</option>
              <option value="Banco de Crédito de Bolivia (BCP)">Banco de Crédito de Bolivia (BCP)</option>
              <option value="Banco Económico S.A.">Banco Económico S.A.</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-stone-300 mb-1">Número de Cuenta Bancaria</label>
            <input
              type="text"
              [(ngModel)]="formNumeroCuenta"
              placeholder="Ej. 1000123456"
              class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-slate-300 dark:border-stone-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="md:col-span-2 space-y-2">
            <label class="block font-semibold text-slate-700 dark:text-stone-300">
              Código QR de Cobro Oficial
            </label>

            <!-- Botón para subir archivo local -->
            <div class="pt-1">
              <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 shadow-sm transition">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                <span>Subir imagen desde mi equipo</span>
                <input type="file" accept="image/*" (change)="onArchivoQrSeleccionado($event)" class="hidden" />
              </label>
            </div>

            <!-- Vista previa del QR cargado (Limpia y con visualizador ampliado) -->
            <div *ngIf="formQr" class="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200 dark:border-stone-700 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 cursor-pointer group" (click)="verQrGrande = true" title="Click para ver en tamaño completo">
                <div class="w-14 h-14 bg-white rounded-xl p-1 shadow-sm border border-slate-200 dark:border-stone-600 flex items-center justify-center shrink-0 overflow-hidden relative group-hover:border-blue-500 transition">
                  <img [src]="formQr" alt="QR" class="w-full h-full object-contain" />
                  <div class="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                  </div>
                </div>
                <div>
                  <span class="text-xs text-slate-700 dark:text-stone-300 font-semibold group-hover:text-blue-600 transition block">Vista previa del QR</span>
                  
                </div>
              </div>
              <button
                type="button"
                (click)="quitarQr()"
                class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold shrink-0 transition cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Botón Guardar Cambios -->
        <div class="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-stone-800">
          <p class="text-[11px] text-slate-400 dark:text-stone-500">
            Configuración oficial de cobros y pagos de la plataforma.
          </p>
          <button
            type="button"
            (click)="guardarCambios()"
            [disabled]="guardando"
            class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <svg *ngIf="guardando" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</span>
          </button>
        </div>
      </div>

      <!-- Modal de Confirmación Animado: DATOS GUARDADOS -->
      <div *ngIf="mostrarModalGuardado" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white dark:bg-stone-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4 transform animate-in zoom-in-95 duration-200">
          <div class="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
            <svg class="w-9 h-9 animate-bounce" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              ¡DATOS GUARDADOS!
            </h3>            
          </div>
          <div class="pt-2">
            <button
              type="button"
              (click)="cerrarModalGuardado()"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal QR Ampliado -->
      <div *ngIf="verQrGrande && formQr" (click)="verQrGrande = false" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm cursor-pointer animate-in fade-in duration-150">
        <div class="relative bg-white dark:bg-stone-900 p-6 rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-200 dark:border-stone-700 flex flex-col items-center" (click)="$event.stopPropagation()">
          <button (click)="verQrGrande = false" class="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-600 dark:text-stone-300 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <h4 class="text-sm font-bold text-slate-800 dark:text-stone-200 mb-4 text-center">Código QR Oficial (Tamaño Completo)</h4>
          <div class="w-64 h-64 sm:w-80 sm:h-80 bg-white p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
            <img [src]="formQr" alt="QR Ampliado" class="w-full h-full object-contain" />
          </div>
          <button
            type="button"
            (click)="verQrGrande = false"
            class="mt-4 px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `
})
export class PerfilAdminComponent implements OnInit {
  usuario: UsuarioAdmin | null = null;
  cargando: boolean = false;
  guardando: boolean = false;
  mensajeToast: string | null = null;
  mostrarModalGuardado: boolean = false;
  verQrGrande: boolean = false;

  // Campos editables del formulario
  formTelefono: string = '';
  formTelefonoEmergencia: string = '';
  formDireccionDomicilio: string = '';
  formDepartamentoRadicatoria: string = 'Santa Cruz';
  formBancoNombre: string = 'Banco Nacional de Bolivia (BNB)';
  formNumeroCuenta: string = '1000123456';
  formQr: string = '';

  ngOnInit() {
    this.cargarPerfil();
  }

  async cargarPerfil() {
    this.cargando = true;
    try {
      // 1. Intentar por email oficial de administrador
      const resp = await fetch(`${API_GATEWAY_URL}/api/v1/usuarios/por-email?email=danielqczn@gmail.com`);
      if (resp.ok) {
        const data: UsuarioAdmin = await resp.json();
        this.usuario = data;
        this.poblarFormulario(data);
      } else {
        // Fallback por lista general buscando el administrador
        const listResp = await fetch(`${API_GATEWAY_URL}/api/v1/usuarios`);
        if (listResp.ok) {
          const list: UsuarioAdmin[] = await listResp.json();
          const admin = list.find(u => (u.rolNombre || '').toUpperCase() === 'ADMINISTRADOR');
          if (admin) {
            this.usuario = admin;
            this.poblarFormulario(admin);
          }
        }
      }

      // Asegurar que el QR oficial persista ante recargas F5
      if (!this.formQr) {
        try {
          const qrResp = await fetch(`${API_GATEWAY_URL}/api/v1/pagos/qr-oficial?t=${Date.now()}`);
          if (qrResp.ok) {
            const qrData = await qrResp.json();
            if (qrData.qr) {
              this.formQr = qrData.qr;
            }
          }
        } catch {}

        if (!this.formQr && typeof localStorage !== 'undefined') {
          const guardadoLocal = localStorage.getItem('alojate_qr_oficial_admin');
          if (guardadoLocal) {
            this.formQr = guardadoLocal;
          }
        }
      }
    } catch (e) {
      console.warn('[PerfilAdmin] Error cargando perfil:', e);
    } finally {
      this.cargando = false;
    }
  }

  poblarFormulario(u: UsuarioAdmin) {
    this.formTelefono = u.telefono || '+591 70000001';
    this.formTelefonoEmergencia = u.telefonoEmergencia || '';
    this.formDireccionDomicilio = u.direccionDomicilio || 'Av. San Martín 1500, Equipetrol';
    this.formDepartamentoRadicatoria = u.departamentoRadicatoria || (u.ciExpedido === 'LPZ' ? 'La Paz' : 'Santa Cruz');
    this.formBancoNombre = u.bancoNombre || 'Banco Nacional de Bolivia (BNB)';
    this.formNumeroCuenta = u.numeroCuentaBancaria || '1000123456';
    const localQr = typeof localStorage !== 'undefined' ? localStorage.getItem('alojate_qr_oficial_admin') : null;
    this.formQr = u.qr || localQr || '';
  }

  getIniciales(): string {
    const n = (this.usuario?.nombre || 'Admin').charAt(0).toUpperCase();
    const a = (this.usuario?.apellido || 'Aloja-Te').charAt(0).toUpperCase();
    return `${n}${a}`;
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '31 de Octubre, 2026';
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return fechaStr;
    }
  }

  onArchivoQrSeleccionado(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar automáticamente a un tamaño óptimo para QR (max 600px)
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          this.formQr = canvas.toDataURL('image/png', 0.9);
        } else {
          this.formQr = e.target.result;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  quitarQr() {
    this.formQr = '';
    try {
      localStorage.removeItem('alojate_qr_oficial_admin');
    } catch {}
  }

  cerrarModalGuardado() {
    this.mostrarModalGuardado = false;
  }

  async guardarCambios() {
    this.guardando = true;
    try {
      const email = this.usuario?.email || 'danielqczn@gmail.com';
      const body = {
        telefono: this.formTelefono,
        telefonoEmergencia: this.formTelefonoEmergencia,
        direccionDomicilio: this.formDireccionDomicilio,
        departamentoRadicatoria: this.formDepartamentoRadicatoria,
        bancoNombre: this.formBancoNombre,
        numeroCuentaBancaria: this.formNumeroCuenta,
        qr: this.formQr
      };

      // Guardar en Gateway API y backend MS-01
      const resp = await fetch(`${API_GATEWAY_URL}/api/v1/usuarios/por-email/cuenta-bancaria?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        throw new Error('Error al guardar en el servidor');
      }

      if (this.usuario) {
        this.usuario.telefono = this.formTelefono;
        this.usuario.telefonoEmergencia = this.formTelefonoEmergencia;
        this.usuario.direccionDomicilio = this.formDireccionDomicilio;
        this.usuario.departamentoRadicatoria = this.formDepartamentoRadicatoria;
        this.usuario.bancoNombre = this.formBancoNombre;
        this.usuario.numeroCuentaBancaria = this.formNumeroCuenta;
        this.usuario.qr = this.formQr;
      }

      try {
        localStorage.setItem('alojate_qr_oficial_admin', this.formQr);
      } catch {}

      // Mostrar modal animado de confirmación
      this.mostrarModalGuardado = true;
      setTimeout(() => {
        this.mostrarModalGuardado = false;
      }, 3500);

    } catch (e) {
      console.warn('[PerfilAdmin] Error guardando perfil:', e);
      alert('Hubo un error al guardar los cambios en el servidor. Intente nuevamente.');
    } finally {
      this.guardando = false;
    }
  }
}
