import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Modular Layout & Features
import { SidebarComponent } from './shared/layout/sidebar.component';
import { TopHeaderComponent } from './shared/layout/top-header.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AlojamientosComponent } from './features/alojamientos/alojamientos.component';
import { ContabilidadComponent } from './features/contabilidad/contabilidad.component';
import { LiquidacionesComponent } from './features/liquidaciones/liquidaciones.component';
import { ReportesIaComponent } from './features/reportes/reportes-ia.component';

// Modals
import { InspeccionModalComponent } from './features/alojamientos/modals/inspeccion-modal.component';
import { HabitacionDetalleModalComponent } from './features/alojamientos/modals/habitacion-detalle-modal.component';
import { FotoLightboxComponent } from './shared/modals/foto-lightbox.component';
import { ObservacionModalComponent } from './shared/modals/observacion-modal.component';
import { RechazoModalComponent } from './shared/modals/rechazo-modal.component';

// Types & Demo Data
import {
  AdminTab,
  SolicitudAlojamiento,
  UnidadAdmin,
  MovimientoContable,
  LiquidacionAnfitrion,
  ValoracionAdmin,
  LightboxState
} from './core/types/admin.types';
import { VALORACIONES_ADMIN_DEMO } from './core/data/valoraciones-demo.data';

const API_GATEWAY_URL =
  (typeof window !== 'undefined' &&
    ((window as any).__ENV__?.API_GATEWAY_URL ||
      (window as any).VITE_API_GATEWAY_URL ||
      (window as any).API_GATEWAY_URL)) ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://aloja-te-admin.duckdns.org'
    : 'http://localhost:8080');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    TopHeaderComponent,
    DashboardComponent,
    AlojamientosComponent,
    ContabilidadComponent,
    LiquidacionesComponent,
    ReportesIaComponent,
    InspeccionModalComponent,
    HabitacionDetalleModalComponent,
    FotoLightboxComponent,
    ObservacionModalComponent,
    RechazoModalComponent
  ],
  template: `
    <div class="h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-carbon-950 text-slate-900 dark:text-stone-100 font-sans selection:bg-blue-600/30 selection:text-white transition-colors duration-300">
      
      <!-- ========================================== -->
      <!-- BARRA LATERAL (SIDEBAR INSTITUCIONAL FIJA) -->
      <!-- ========================================== -->
      <app-admin-sidebar
        class="h-full shrink-0 flex flex-col z-20"
        [activeTab]="activeTab"
        [conteoPendientes]="conteoPendientes"
        [conteoObservados]="conteoObservados"
        [isDarkMode]="isDarkMode"
        (tabCambiado)="cambiarTab($event)"
        (onToggleTheme)="toggleTheme()"
        (onCerrarSesion)="cerrarSesionAdmin()">
      </app-admin-sidebar>

      <!-- ========================================== -->
      <!-- CONTENEDOR PRINCIPAL DE CONTENIDO          -->
      <!-- ========================================== -->
      <div class="flex-1 h-full flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        <!-- Encabezado Superior Sticky -->
        <app-admin-top-header
          class="sticky top-0 z-10 shrink-0 block"
          [activeTab]="activeTab"
          [isDarkMode]="isDarkMode"
          (toggleTheme)="toggleTheme()">
        </app-admin-top-header>

        <!-- Vistas Modulares del Administrador -->
        <main class="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <!-- 1. Dashboard General -->
          <app-dashboard-feature
            *ngIf="activeTab === 'dashboard'"
            [alojamientos]="alojamientos"
            [liquidaciones]="liquidaciones"
            [movimientos]="movimientos"
            (irATab)="cambiarTab($event)"
            (inspeccionarAlojamiento)="abrirInspeccion($event)">
          </app-dashboard-feature>

          <!-- 2. Bandeja de Alojamientos & Moderación -->
          <app-alojamientos-feature
            *ngIf="activeTab === 'alojamientos'"
            [alojamientos]="alojamientos"
            [cargando]="cargandoAlojamientos"
            (inspeccionar)="abrirInspeccion($event.alojamiento, $event.subTab)"
            (aprobar)="aprobarAlojamiento($event)"
            (observar)="abrirObservacion($event)"
            (rechazar)="abrirRechazo($event)"
            (suspender)="suspenderAlojamiento($event)"
            (onSincronizar)="cargarAlojamientos()"
            (onAbrirFoto)="abrirFotoLightbox($event.url, $event.index, $event.fotos, $event.titulo, $event.alerta)">
          </app-alojamientos-feature>

          <!-- 3. Contabilidad & Libro Diario -->
          <app-contabilidad-feature
            *ngIf="activeTab === 'contabilidad'"
            [movimientos]="movimientos"
            (exportarExcel)="exportarExcelSimulado()">
          </app-contabilidad-feature>

          <!-- 4. Liquidaciones BNB -->
          <app-liquidaciones-feature
            *ngIf="activeTab === 'liquidaciones'"
            [liquidaciones]="liquidaciones"
            (autorizarLote)="autorizarLotePagos()">
          </app-liquidaciones-feature>

          <!-- 5. Reportes & Copilot IA -->
          <app-reportes-ia-feature
            *ngIf="activeTab === 'reportes-ia'"
            [alojamientos]="alojamientos"
            [liquidaciones]="liquidaciones">
          </app-reportes-ia-feature>
        </main>
      </div>

      <!-- ========================================== -->
      <!-- MODALES Y DIÁLOGOS GLOBALES                -->
      <!-- ========================================== -->

      <!-- Modal de Inspección de Alojamiento (General, Habitaciones, Reseñas) -->
      <app-inspeccion-modal
        *ngIf="alojamientoInspeccionado"
        [alojamiento]="alojamientoInspeccionado"
        [subTab]="subTabInspeccion"
        [resenasAlojamiento]="resenasAlojamientoActual"
        (cerrar)="cerrarInspeccion()"
        (aprobar)="aprobarAlojamiento($event)"
        (observar)="abrirObservacion($event)"
        (rechazar)="abrirRechazo($event)"
        (suspender)="suspenderAlojamiento($event)"
        (abrirHabitacionDetalle)="abrirHabitacionDetalle($event)"
        (abrirFoto)="abrirFotoLightbox($event.url, $event.index, $event.fotos, $event.titulo, $event.alerta)">
      </app-inspeccion-modal>

      <!-- Modal de Inspección Detallada de Habitación (Permite ver fotos individuales de la habitación) -->
      <app-habitacion-detalle-modal
        *ngIf="habitacionEnDetalle"
        [habitacion]="habitacionEnDetalle"
        [alojamiento]="alojamientoInspeccionado"
        (onCerrar)="cerrarHabitacionDetalle()"
        (onClose)="cerrarHabitacionDetalle()"
        (onToggleEstado)="alternarEstadoHabitacion($event)"
        (onObservarHabitacion)="observarHabitacionDesdeModal($event)"
        (abrirFoto)="abrirFotoLightbox($event.url, $event.index, $event.galeria, $event.titulo, $event.alertaObservacion)">
      </app-habitacion-detalle-modal>

      <!-- Lightbox de Pantalla Completa para Fotos -->
      <app-foto-lightbox
        [activo]="lightboxState.activo"
        [urlActual]="lightboxState.urlActual"
        [indiceActual]="lightboxState.indiceActual"
        [galeria]="lightboxState.galeria"
        [titulo]="lightboxState.titulo"
        [alertaObservacion]="lightboxState.alertaObservacion"
        (onClose)="cerrarFotoLightbox()"
        (onCerrar)="cerrarFotoLightbox()"
        (onCambiarIndice)="cambiarIndiceLightbox($event)">
      </app-foto-lightbox>

      <!-- Modal de Observación -->
      <app-observacion-modal
        *ngIf="alojamientoParaObservacion"
        [alojamiento]="alojamientoParaObservacion"
        (onConfirmar)="confirmarObservacion($event.id, $event.motivo)"
        (onClose)="alojamientoParaObservacion = null">
      </app-observacion-modal>

      <!-- Modal de Rechazo -->
      <app-rechazo-modal
        *ngIf="alojamientoParaRechazo"
        [alojamiento]="alojamientoParaRechazo"
        (onConfirmar)="confirmarRechazo($event.id, $event.motivo)"
        (onClose)="alojamientoParaRechazo = null">
      </app-rechazo-modal>

    </div>
  `
})
export class AppComponent implements OnInit {
  activeTab: AdminTab = 'dashboard';
  isDarkMode: boolean = true;
  cargandoAlojamientos: boolean = false;
  idPendienteInspeccion: string | null = null;

  // Colecciones
  alojamientos: SolicitudAlojamiento[] = [];
  movimientos: MovimientoContable[] = [];
  liquidaciones: LiquidacionAnfitrion[] = [
    {
      id: 'LIQ-2026-001',
      anfitrion: 'Carlos Mendoza',
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
      alojamiento: 'Hostal Mirador Titicaca',
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

  // Estado de inspección
  alojamientoInspeccionado: SolicitudAlojamiento | null = null;
  subTabInspeccion: 'general' | 'habitaciones' | 'resenas' = 'general';
  habitacionEnDetalle: UnidadAdmin | null = null;
  resenasAlojamientoActual: ValoracionAdmin[] = [];

  alojamientoParaObservacion: SolicitudAlojamiento | null = null;
  alojamientoParaRechazo: SolicitudAlojamiento | null = null;

  // Estado de Lightbox
  lightboxState: LightboxState = {
    activo: false,
    urlActual: '',
    indiceActual: 0,
    galeria: []
  };

  ngOnInit() {
    try {
      localStorage.removeItem('alojate_admin_alojamientos');
    } catch {}
    this.inicializarTema();
    this.cargarCacheLocal();
    this.sincronizarRuta();

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.sincronizarRuta());
    }

    this.cargarAlojamientos();
    this.cargarMovimientos();
  }

  // --- Teclado Global para Lightbox (Garantiza funcionamiento siempre) ---
  @HostListener('window:keydown', ['$event'])
  manejarTecladoGlobal(event: KeyboardEvent) {
    if (!this.lightboxState.activo) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cerrarFotoLightbox();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.fotoSiguienteLightbox();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.fotoAnteriorLightbox();
    }
  }

  fotoSiguienteLightbox() {
    if (!this.lightboxState.galeria || this.lightboxState.galeria.length <= 1) return;
    const prox = (this.lightboxState.indiceActual + 1) % this.lightboxState.galeria.length;
    this.cambiarIndiceLightbox(prox);
  }

  fotoAnteriorLightbox() {
    if (!this.lightboxState.galeria || this.lightboxState.galeria.length <= 1) return;
    const ant = (this.lightboxState.indiceActual - 1 + this.lightboxState.galeria.length) % this.lightboxState.galeria.length;
    this.cambiarIndiceLightbox(ant);
  }

  // --- Manejo de Tema ---
  inicializarTema() {
    try {
      const savedTheme = localStorage.getItem('alojate_theme_mode');
      this.isDarkMode = savedTheme !== 'light';
    } catch {
      this.isDarkMode = true;
    }
    this.aplicarTema();
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

  cerrarSesionAdmin() {
    try {
      localStorage.removeItem('alojate_admin_token');
      localStorage.removeItem('alojate_token');
      localStorage.removeItem('alojate_user');
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.href = window.location.hostname !== 'localhost' ? 'https://aloja-te.duckdns.org' : 'http://localhost:3000';
    }
  }

  // --- Rutas ---
  cambiarTab(tab: AdminTab) {
    this.activeTab = tab;
    if (tab === 'alojamientos' && this.alojamientoInspeccionado) {
      window.location.hash = `#/alojamientos/${this.alojamientoInspeccionado.id}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
    try {
      localStorage.setItem('alojate_admin_tab', tab);
    } catch {}
  }

  sincronizarRuta() {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#\/?!?\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    const rutaBase = parts[0];

    if (['dashboard', 'contabilidad', 'liquidaciones', 'reportes-ia'].includes(rutaBase)) {
      this.activeTab = rutaBase as AdminTab;
      this.alojamientoInspeccionado = null;
    } else if (rutaBase === 'alojamientos') {
      this.activeTab = 'alojamientos';
      const alojId = parts[1];
      if (alojId) {
        const item = this.alojamientos.find(a => a.id === alojId);
        if (item) {
          this.alojamientoInspeccionado = item;
        } else {
          this.idPendienteInspeccion = alojId;
        }
      }
    } else {
      try {
        const savedTab = localStorage.getItem('alojate_admin_tab') as AdminTab;
        if (savedTab && ['dashboard', 'contabilidad', 'alojamientos', 'liquidaciones', 'reportes-ia'].includes(savedTab)) {
          this.activeTab = savedTab;
        }
      } catch {}
    }
  }

  get conteoPendientes(): number {
    return this.alojamientos.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_REVISION').length;
  }

  get conteoObservados(): number {
    return this.alojamientos.filter(a => a.estado === 'OBSERVADO').length;
  }

  // --- Carga de Alojamientos ---
  cargarCacheLocal() {
    this.alojamientos = [];
  }

  async cargarAlojamientos() {
    this.cargandoAlojamientos = true;
    try {
      let rawData: any[] = [];

      try {
        const resTodos = await fetch(`${API_GATEWAY_URL}/api/v1/alojamientos/todos`);
        if (resTodos.ok) rawData = await resTodos.json();
      } catch {}

      try {
        const resPendientes = await fetch(`${API_GATEWAY_URL}/api/v1/alojamientos/moderacion/pendientes`);
        if (resPendientes.ok) {
          const pendientesData: any[] = await resPendientes.json();
          const idSet = new Set(rawData.map((r: any) => r.idAlojamiento || r.id));
          for (const p of pendientesData) {
            const pId = p.idAlojamiento || p.id;
            if (!idSet.has(pId)) {
              rawData.push(p);
              idSet.add(pId);
            }
          }
        }
      } catch {}

      if (Array.isArray(rawData) && rawData.length > 0) {
        this.alojamientos = rawData.map(raw => this.mapearAlojamientoBackend(raw));
      } else {
        this.alojamientos = [];
      }

      try {
        localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(this.alojamientos));
      } catch {}

      if (this.idPendienteInspeccion) {
        const item = this.alojamientos.find(a => a.id === this.idPendienteInspeccion);
        if (item) this.alojamientoInspeccionado = item;
        this.idPendienteInspeccion = null;
      }
    } catch {
      this.alojamientos = [];
    } finally {
      this.cargandoAlojamientos = false;
    }
  }

  private mapearAlojamientoBackend(raw: any): SolicitudAlojamiento {
    const u = raw.unidades?.[0];
    const rawFotosList: any[] = (raw.fotografias && raw.fotografias.length > 0)
      ? raw.fotografias.map((f: any) => (typeof f === 'string' ? f : (f.url || f))).filter(Boolean)
      : ((raw.fotos || []).filter(Boolean));
    const fotosList: string[] = Array.from(new Set(rawFotosList.map(f => typeof f === 'string' ? f.trim() : f?.url?.trim() || f).filter(Boolean)));
    const principalObj = Array.isArray(raw.fotografias) ? raw.fotografias.find((f: any) => f.esPrincipal) : null;
    const foto = principalObj?.url || fotosList[0] || raw.imagen || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';
    if (fotosList.length === 0) fotosList.push(foto);

    return {
      id: raw.idAlojamiento || raw.id || String(Math.random()),
      titulo: raw.titulo || 'Alojamiento Tradicional',
      anfitrion: raw.nombreAnfitrion || raw.anfitrion || 'Anfitrión Registrado',
      departamento: raw.departamento || 'La Paz',
      ciudad: raw.ciudad || 'Bolivia',
      direccion: raw.direccion || '',
      tipoPropiedad: raw.tipoPropiedadNombre || raw.tipoPropiedad || 'Hospedaje Tradicional',
      modalidad: raw.modalidad || 'CASA_DEPARTAMENTO',
      precioNoche: Number(u?.precioNoche ?? raw.precioNoche ?? raw.precioBaseNoche ?? 500),
      capacidad: Number(u?.capacidadHuespedes ?? raw.capacidad ?? 4),
      habitaciones: Number(u?.cantidadDormitorios ?? raw.habitaciones ?? 2),
      estado: (raw.estadoPublicacion as any) || (raw.estado as any) || 'PENDIENTE',
      fechaRegistro: raw.fechaCreacion || raw.fechaRegistro || new Date().toISOString(),
      imagen: foto,
      fotos: fotosList,
      descripcion: raw.descripcion || '',
      politicas: raw.politicas || 'Ambiente respetuoso y cumplimiento de horarios de ingreso.',
      horarioEntrada: raw.horarioEntrada || '14:00',
      horarioSalida: raw.horarioSalida || '11:00',
      motivoRechazo: raw.motivoObservacionRechazo || raw.motivoRechazo || '',
      motivoObservacionRechazo: raw.motivoObservacionRechazo || raw.motivoRechazo || '',
      origenUltimoCambio: raw.origenUltimoCambio || '',
      unidades: (raw.unidades || []).map((un: any) => {
        const rawFotos: any[] = (un.fotos && un.fotos.length > 0)
          ? un.fotos
          : (un.fotografias || (un.fotoUrl ? [un.fotoUrl] : []));
        const fotosArray: string[] = Array.from(new Set(rawFotos
          .map((f: any) => (typeof f === 'string' ? f.trim() : f?.url?.trim()))
          .filter(Boolean)));
        return {
          idUnidad: un.idUnidad || `u-${Math.random()}`,
          nombre: un.nombre,
          capacidadHuespedes: un.capacidadHuespedes ?? un.capacidadPersonas ?? 2,
          cantidadCamas: un.cantidadCamas ?? 1,
          cantidadBanos: un.cantidadBanos ?? un.cantidadBanios ?? 1,
          inventarioTotal: un.inventarioTotal ?? 1,
          precioNoche: Number(un.precioNoche ?? 0),
          estado: un.estado || 'DISPONIBLE',
          descripcion: un.descripcion || '',
          fotos: fotosArray
        };
      }),
      servicios: (raw.servicios || []).length > 0
        ? (raw.servicios || []).map((s: any) => s.nombre || s)
        : ['WiFi de Alta Velocidad', 'Parqueo Privado', 'Agua Caliente 24/7']
    };
  }

  cargarAlojamientosFallback() {
    this.alojamientos = [];
    try {
      localStorage.setItem('alojate_admin_alojamientos', JSON.stringify([]));
    } catch {}
  }

  // --- Contabilidad ---
  async cargarMovimientos() {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/finanzas/contabilidad`);
      if (res.ok) {
        this.movimientos = await res.json();
        return;
      }
    } catch {}

    this.movimientos = [
      { movimientoId: 1, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Recaudación por Reserva QR BNB (Banco BNB)', tipo: 'DEBITO', monto: 1842.75, origenTipo: 'COBRO_QR_BNB', createdAt: new Date().toISOString() },
      { movimientoId: 2, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Liquidación Neta a Anfitrión (Transferencia ACH)', tipo: 'CREDITO', monto: 1579.50, origenTipo: 'LIQUIDACION_NETA', createdAt: new Date().toISOString() },
      { movimientoId: 3, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Comisión de Plataforma Aloja-Te (10%)', tipo: 'CREDITO', monto: 175.50, origenTipo: 'COMISION_ALOJATE', createdAt: new Date().toISOString() },
      { movimientoId: 4, asientoId: 'TRX-BNB-20261029-001', cuenta: 'Cargo por Servicio y Conectividad (5%)', tipo: 'CREDITO', monto: 87.75, origenTipo: 'CARGO_SERVICIO', createdAt: new Date().toISOString() }
    ];
  }

  // --- Inspección y Modales ---
  abrirInspeccion(a: SolicitudAlojamiento, subTab: 'general' | 'habitaciones' | 'resenas' = 'general') {
    this.alojamientoInspeccionado = a;
    this.subTabInspeccion = subTab;
    this.habitacionEnDetalle = null;
    this.activeTab = 'alojamientos';
    window.location.hash = `#/alojamientos/${a.id}`;
    this.cargarResenasAlojamiento(a.id);
  }

  cerrarInspeccion() {
    this.alojamientoInspeccionado = null;
    this.habitacionEnDetalle = null;
    this.resenasAlojamientoActual = [];
    window.location.hash = '#/alojamientos';
  }

  abrirHabitacionDetalle(u: UnidadAdmin) {
    this.habitacionEnDetalle = u;
  }

  cerrarHabitacionDetalle() {
    this.habitacionEnDetalle = null;
  }

  async alternarEstadoHabitacion(u: UnidadAdmin) {
    const nuevoEstado = u.estado === 'MANTENIMIENTO' ? 'DISPONIBLE' : 'MANTENIMIENTO';
    try {
      await fetch(`${API_GATEWAY_URL}/api/v1/unidades/${u.idUnidad}/estado?estado=${nuevoEstado}`, { method: 'PATCH' });
    } catch {}
    u.estado = nuevoEstado;
    this.persistirCambiosLocal();
    alert(`Habitación "${u.nombre}" actualizada a ${nuevoEstado === 'DISPONIBLE' ? 'Disponible' : 'En Mantenimiento'}.`);
  }

  observarHabitacionDesdeModal(u: UnidadAdmin) {
    if (!this.alojamientoInspeccionado) return;
    const motivo = `Observación técnica en ${u.nombre}: revisión fotográfica requerida.`;
    this.confirmarObservacion(this.alojamientoInspeccionado.id, motivo);
    u.estado = 'OBSERVADO';
  }

  async cargarResenasAlojamiento(idAlojamiento: string) {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/alojamientos/${idAlojamiento}/valoraciones`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.resenasAlojamientoActual = data;
          return;
        }
      }
    } catch {}
    this.resenasAlojamientoActual = [];
  }

  // --- Acciones de Moderación ---
  abrirObservacion(a: SolicitudAlojamiento) {
    this.alojamientoParaObservacion = a;
  }

  async confirmarObservacion(id: string, motivo: string) {
    this.persistirCambioEstado(id, 'OBSERVADO', motivo);
    try {
      await fetch(`${API_GATEWAY_URL}/api/v1/alojamientos/${id}/observar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo, origen: 'ADMIN_MANUAL' })
      });
    } catch {}
    alert('Publicación marcada como OBSERVADA.');
    this.cargarAlojamientos();
  }

  abrirRechazo(a: SolicitudAlojamiento) {
    this.alojamientoParaRechazo = a;
  }

  async confirmarRechazo(id: string, motivo: string) {
    this.persistirCambioEstado(id, 'RECHAZADO', motivo);
    try {
      await fetch(`${API_GATEWAY_URL}/api/v1/alojamientos/${id}/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
      });
    } catch {}
    alert('Publicación RECHAZADA.');
    this.cargarAlojamientos();
  }

  async aprobarAlojamiento(id: string) {
    this.persistirCambioEstado(id, 'PUBLICADO');
    const item = this.alojamientos.find(a => a.id === id);
    if (item?.unidades) {
      item.unidades.forEach(u => u.estado = 'DISPONIBLE');
    }
    try {
      await fetch(`${API_GATEWAY_URL}/api/v1/alojamientos/${id}/aceptar`, { method: 'POST' });
    } catch {}
    alert('Alojamiento APROBADO y PUBLICADO en el catálogo.');
    this.cargarAlojamientos();
  }

  async suspenderAlojamiento(id: string) {
    if (!confirm('¿Desea pausar o suspender temporalmente este alojamiento del catálogo?')) return;
    this.persistirCambioEstado(id, 'SUSPENDIDO', 'Pausado por administración');
    const item = this.alojamientos.find(a => a.id === id);
    if (item?.unidades) {
      item.unidades.forEach(u => u.estado = 'MANTENIMIENTO');
    }
    try {
      await fetch(`${API_GATEWAY_URL}/api/v1/alojamientos/${id}/estado?estado=SUSPENDIDO`, { method: 'PATCH' });
    } catch {}
    alert('Alojamiento pausado del catálogo.');
    this.cargarAlojamientos();
  }

  private persistirCambioEstado(id: string, nuevoEstado: any, motivo?: string) {
    const item = this.alojamientos.find(a => a.id === id);
    if (item) {
      item.estado = nuevoEstado;
      if (motivo) {
        item.motivoRechazo = motivo;
        item.motivoObservacionRechazo = motivo;
      } else if (nuevoEstado === 'PUBLICADO') {
        item.motivoRechazo = undefined;
        item.motivoObservacionRechazo = undefined;
      }
    }
    this.persistirCambiosLocal();
  }

  private persistirCambiosLocal() {
    try {
      localStorage.setItem('alojate_admin_alojamientos', JSON.stringify(this.alojamientos));
    } catch {}
  }

  // --- Lightbox ---
  abrirFotoLightbox(url: string, index: number = 0, fotos?: string[], titulo?: string, alertaObservacion?: string) {
    const galeria = (fotos && fotos.length > 0) ? fotos : [url];
    let targetIndex = index;
    if (targetIndex < 0 || targetIndex >= galeria.length) {
      const found = galeria.indexOf(url);
      targetIndex = found >= 0 ? found : 0;
    }

    this.lightboxState = {
      activo: true,
      urlActual: galeria[targetIndex] || url,
      indiceActual: targetIndex,
      galeria,
      titulo: titulo || this.alojamientoInspeccionado?.titulo || 'Fotografía de Inspección Técnica',
      alertaObservacion
    };
  }

  cambiarIndiceLightbox(idx: number) {
    this.lightboxState.indiceActual = idx;
    if (this.lightboxState.galeria && this.lightboxState.galeria.length > idx) {
      this.lightboxState.urlActual = this.lightboxState.galeria[idx];
    }
  }

  cerrarFotoLightbox() {
    this.lightboxState.activo = false;
  }

  // --- Operaciones Globales ---
  autorizarLotePagos() {
    this.liquidaciones.forEach(l => {
      if (l.estado === 'PENDIENTE') l.estado = 'EN_PROCESO';
    });
    alert('Lote de pagos ACH autorizado para liquidación con Banco BNB.');
  }

  exportarExcelSimulado() {
    alert('Exportando Libro Diario en formato CSV...');
  }
}
