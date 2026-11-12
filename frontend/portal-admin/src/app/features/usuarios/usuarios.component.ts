import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioAdmin } from '../../core/types/admin.types';

const API_GATEWAY_URL =
  (typeof window !== 'undefined' &&
    ((window as any).__ENV__?.API_GATEWAY_URL ||
      (window as any).VITE_API_GATEWAY_URL ||
      (window as any).API_GATEWAY_URL)) ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://aloja-te-admin.duckdns.org'
    : 'http://localhost:8080');

@Component({
  selector: 'app-usuarios-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado con Métricas Principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Tarjeta 1: Total Usuarios -->
        <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Total Usuarios Registrados</p>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ totalUsuarios }}</h3>            
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <!-- Tarjeta 2: Clientes -->
        <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Huéspedes / Clientes</p>
            <h3 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ totalClientes }}</h3>            
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        <!-- Tarjeta 3: Anfitriones -->
        <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Anfitriones Verificados</p>
            <h3 class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{{ totalAnfitriones }}</h3>            
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <!-- Tarjeta 4: Administradores -->
        <div class="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Administradores Globales</p>
            <h3 class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ totalAdmins }}</h3>            
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros por Rol & Búsqueda -->
      <div class="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Pestañas de Filtro por Rol -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            (click)="filtroRol = 'TODOS'"
            [class]="filtroRol === 'TODOS'
              ? 'px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20'
              : 'px-4 py-2 rounded-xl text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 text-xs font-medium transition'"
          >
            Todos ({{ totalUsuarios }})
          </button>
          <button
            type="button"
            (click)="filtroRol = 'CLIENTE'"
            [class]="filtroRol === 'CLIENTE'
              ? 'px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20'
              : 'px-4 py-2 rounded-xl text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 text-xs font-medium transition'"
          >
            Clientes ({{ totalClientes }})
          </button>
          <button
            type="button"
            (click)="filtroRol = 'ANFITRION'"
            [class]="filtroRol === 'ANFITRION'
              ? 'px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md shadow-purple-500/20'
              : 'px-4 py-2 rounded-xl text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 text-xs font-medium transition'"
          >
            Anfitriones ({{ totalAnfitriones }})
          </button>
          <button
            type="button"
            (click)="filtroRol = 'ADMINISTRADOR'"
            [class]="filtroRol === 'ADMINISTRADOR'
              ? 'px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-700/20'
              : 'px-4 py-2 rounded-xl text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 text-xs font-medium transition'"
          >
            Administradores ({{ totalAdmins }})
          </button>
        </div>

        <!-- Buscador y Botón Recargar -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="relative flex-1 md:w-72">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="busqueda"
              placeholder="Buscar por nombre, CI o email..."
              class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            (click)="cargarUsuarios()"
            [disabled]="cargando"
            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-slate-50 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-200 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <svg [class.animate-spin]="cargando" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Tabla de Usuarios Registrados -->
      <div class="rounded-2xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-stone-800/50 border-b border-slate-200 dark:border-stone-800 text-slate-500 dark:text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                <th class="py-3.5 px-4">Usuario</th>
                <th class="py-3.5 px-4">Rol & Tipo</th>
                <th class="py-3.5 px-4">Contacto (Email / Celular)</th>
                <th class="py-3.5 px-4">C.I. Oficial</th>
                <th class="py-3.5 px-4">Cuenta Bancaria</th>
                <th class="py-3.5 px-4">Estado</th>
                <th class="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-stone-800 text-slate-700 dark:text-stone-300">
              <tr *ngIf="cargando">
                <td colspan="7" class="py-12 text-center text-slate-400">
                  <div class="flex items-center justify-center gap-2">
                    <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Cargando directorio oficial de usuarios...</span>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!cargando && usuariosFiltrados.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400">
                  No se encontraron usuarios registrados con los criterios seleccionados.
                </td>
              </tr>

              <tr *ngFor="let u of usuariosFiltrados" class="hover:bg-slate-50/60 dark:hover:bg-stone-800/40 transition">
                <!-- 1. Nombre e Iniciales -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div [class]="getAvatarBg(u.rolNombre)" class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                      {{ getIniciales(u.nombre, u.apellido) }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{{ u.nombre }} {{ u.apellido }}</span>
                      </div>                      
                    </div>
                  </div>
                </td>

                <!-- 2. Rol & Tipo de Cuenta -->
                <td class="py-3.5 px-4">
                  <div class="space-y-1">
                    <span [class]="getBadgeRol(u.rolNombre)" class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border">
                      {{ u.rolNombre || 'USUARIO' }}
                    </span>
                    <div class="text-[10px] text-slate-500 dark:text-stone-400 font-medium">
                      {{ u.tipoCuenta || 'ESTÁNDAR' }}
                    </div>
                  </div>
                </td>

                <!-- 3. Contacto -->
                <td class="py-3.5 px-4">
                  <div>
                    <div class="font-medium text-slate-800 dark:text-stone-200">{{ u.email }}</div>
                    <div class="text-[11px] text-slate-400">{{ u.telefono || 'Sin teléfono' }}</div>
                  </div>
                </td>

                <!-- 4. Documento C.I. -->
                <td class="py-3.5 px-4">
                  <div *ngIf="u.ci" class="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-800 dark:text-stone-200 bg-slate-100 dark:bg-stone-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-stone-700">
                    <span>{{ u.ci }}</span>
                    <span class="text-blue-600 dark:text-blue-400 font-bold">{{ u.ciExpedido }}</span>
                  </div>
                  <span *ngIf="!u.ci" class="text-slate-400 text-[11px] italic">No registrado</span>
                </td>

                <!-- 5. Cuenta Bancaria -->
                <td class="py-3.5 px-4">
                  <div *ngIf="u.bancoNombre">
                    <div class="font-semibold text-slate-800 dark:text-stone-200 text-[11px]">{{ u.bancoNombre }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ u.numeroCuentaBancaria || 'S/N' }}</div>
                  </div>
                  <span *ngIf="!u.bancoNombre" class="text-slate-400 text-[11px] italic">Sin cuenta bancaria</span>
                </td>

                <!-- 6. Estado -->
                <td class="py-3.5 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{{ u.estado || 'ACTIVO' }}</span>
                  </span>
                </td>

                <!-- 7. Acciones -->
                <td class="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    (click)="seleccionarUsuario(u)"
                    class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-stone-700 hover:border-blue-500 bg-white dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-semibold transition shadow-sm"
                  >
                    Ver Ficha
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Detalle / Ficha del Usuario -->
      <div *ngIf="usuarioSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div class="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Encabezado del Modal -->
          <div class="p-6 border-b border-slate-100 dark:border-stone-800 flex items-center justify-between bg-slate-50/50 dark:bg-stone-800/40">
            <div class="flex items-center gap-3.5">
              <div [class]="getAvatarBg(usuarioSeleccionado.rolNombre)" class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md">
                {{ getIniciales(usuarioSeleccionado.nombre, usuarioSeleccionado.apellido) }}
              </div>
              <div>
                <h3 class="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  {{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}
                </h3>
                <div class="flex items-center gap-2 mt-0.5">
                  <span [class]="getBadgeRol(usuarioSeleccionado.rolNombre)" class="px-2 py-0.5 rounded-full text-[10px] font-bold border">
                    {{ usuarioSeleccionado.rolNombre }}
                  </span>
                  <span class="text-xs text-slate-400 font-mono">{{ usuarioSeleccionado.tipoCuenta }}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              (click)="cerrarModal()"
              class="w-9 h-9 rounded-xl border border-slate-200 dark:border-stone-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-stone-800 transition"
            >
              ✕
            </button>
          </div>

          <!-- Cuerpo con todos los Atributos de Usuario -->
          <div class="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
            <!-- Sección: Identificación del Sistema -->
            <div>
              <h4 class="font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-[10px] mb-3">
                Identificación del Sistema
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-stone-800/50 border border-slate-100 dark:border-stone-800">
                
                <div>
                  <span class="text-slate-400 block text-[10px]">Estado de la Cuenta:</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-bold uppercase">{{ usuarioSeleccionado.estado || 'ACTIVO' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">Fecha de Registro Oficial:</span>
                  <span class="text-slate-700 dark:text-stone-300 font-medium">{{ formatearFecha(usuarioSeleccionado.fechaRegistro) }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">Rol Asignado (idRol):</span>
                  <span class="text-slate-700 dark:text-stone-300 font-medium">Nivel {{ usuarioSeleccionado.idRol }} ({{ usuarioSeleccionado.rolNombre }})</span>
                </div>
              </div>
            </div>

            <!-- Sección: Datos Personales & Documento -->
            <div>
              <h4 class="font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-[10px] mb-3">
                Información Personal y Cédula de Identidad
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-stone-800/50 border border-slate-100 dark:border-stone-800">
                <div>
                  <span class="text-slate-400 block text-[10px]">Cédula de Identidad (CI):</span>
                  <span class="font-semibold text-slate-800 dark:text-stone-200">
                    {{ usuarioSeleccionado.ci || 'No registrado' }} {{ usuarioSeleccionado.ciExpedido }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">Correo Electrónico Oficial:</span>
                  <span class="font-semibold text-slate-800 dark:text-stone-200">{{ usuarioSeleccionado.email }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">Teléfono Celular / WhatsApp:</span>
                  <span class="font-semibold text-slate-800 dark:text-stone-200">{{ usuarioSeleccionado.telefono || 'Sin teléfono' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">Teléfono de Emergencia:</span>
                  <span class="font-semibold text-slate-800 dark:text-stone-200">{{ usuarioSeleccionado.telefonoEmergencia || 'No registrado' }}</span>
                </div>
              </div>
            </div>

            <!-- Sección: Datos Bancarios & QR -->
            <div>
              <h4 class="font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-[10px] mb-3">
                Datos Bancarios y Acreditación de Pagos
              </h4>
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-stone-800/50 border border-slate-100 dark:border-stone-800 space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span class="text-slate-400 block text-[10px]">Entidad Financiera (Banco):</span>
                    <span class="font-bold text-slate-800 dark:text-stone-200">{{ usuarioSeleccionado.bancoNombre || 'Sin cuenta bancaria vinculada' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10px]">Número de Cuenta:</span>
                    <span class="font-mono text-slate-800 dark:text-stone-200 font-semibold">{{ usuarioSeleccionado.numeroCuentaBancaria || 'N/A' }}</span>
                  </div>
                </div>

                <div *ngIf="usuarioSeleccionado.qr" class="pt-2 border-t border-slate-200 dark:border-stone-700 flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 dark:border-stone-700 shrink-0">
                    <img [src]="usuarioSeleccionado.qr" alt="QR" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span class="text-[11px] font-semibold text-slate-800 dark:text-stone-200 block">QR de Recaudación / Cobro Vinculado</span>
                    <a [href]="usuarioSeleccionado.qr" target="_blank" class="text-[10px] text-blue-600 hover:underline">Ver comprobante QR original</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pie del Modal -->
          <div class="p-4 border-t border-slate-100 dark:border-stone-800 flex justify-end bg-slate-50/50 dark:bg-stone-800/40">
            <button
              type="button"
              (click)="cerrarModal()"
              class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-semibold transition"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioAdmin[] = [];
  cargando: boolean = false;
  filtroRol: 'TODOS' | 'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR' = 'TODOS';
  busqueda: string = '';
  usuarioSeleccionado: UsuarioAdmin | null = null;

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    try {
      const resp = await fetch(`${API_GATEWAY_URL}/api/v1/usuarios`);
      if (resp.ok) {
        const data: UsuarioAdmin[] = await resp.json();
        this.usuarios = Array.isArray(data) ? data : [];
      } else {
        this.usuarios = [];
      }
    } catch (e) {
      console.warn('[UsuariosComponent] Error al conectar con Gateway MS-01:', e);
      this.usuarios = [];
    } finally {
      this.cargando = false;
    }
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalClientes(): number {
    return this.usuarios.filter(u => (u.rolNombre || '').toUpperCase() === 'CLIENTE').length;
  }

  get totalAnfitriones(): number {
    return this.usuarios.filter(u => (u.rolNombre || '').toUpperCase() === 'ANFITRION').length;
  }

  get totalAdmins(): number {
    return this.usuarios.filter(u => (u.rolNombre || '').toUpperCase() === 'ADMINISTRADOR').length;
  }

  get usuariosFiltrados(): UsuarioAdmin[] {
    return this.usuarios.filter(u => {
      // Filtro de rol
      if (this.filtroRol !== 'TODOS') {
        if ((u.rolNombre || '').toUpperCase() !== this.filtroRol) return false;
      }

      // Filtro de búsqueda
      if (this.busqueda.trim()) {
        const q = this.busqueda.toLowerCase();
        const nom = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
        const em = (u.email || '').toLowerCase();
        const ci = (u.ci || '').toLowerCase();
        const id = (u.idUsuario || '').toLowerCase();
        return nom.includes(q) || em.includes(q) || ci.includes(q) || id.includes(q);
      }

      return true;
    });
  }

  getIniciales(nombre?: string, apellido?: string): string {
    const n = (nombre || '').trim().charAt(0).toUpperCase();
    const a = (apellido || '').trim().charAt(0).toUpperCase();
    return `${n}${a}` || 'U';
  }

  getAvatarBg(rol?: string): string {
    const r = (rol || '').toUpperCase();
    if (r === 'ADMINISTRADOR') return 'bg-gradient-to-tr from-blue-700 to-indigo-600';
    if (r === 'ANFITRION') return 'bg-gradient-to-tr from-purple-700 to-indigo-600';
    return 'bg-gradient-to-tr from-emerald-600 to-teal-600';
  }

  getBadgeRol(rol?: string): string {
    const r = (rol || '').toUpperCase();
    if (r === 'ADMINISTRADOR') {
      return 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (r === 'ANFITRION') {
      return 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return 'Reciente';
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return fechaStr;
    }
  }

  seleccionarUsuario(u: UsuarioAdmin) {
    this.usuarioSeleccionado = u;
  }

  cerrarModal() {
    this.usuarioSeleccionado = null;
  }
}
