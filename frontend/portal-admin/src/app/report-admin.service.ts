import { Injectable } from '@angular/core';

const API_GATEWAY_URL =
  (typeof window !== 'undefined' &&
    ((window as any).__ENV__?.API_GATEWAY_URL ||
      (window as any).VITE_API_GATEWAY_URL ||
      (window as any).API_GATEWAY_URL)) ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://aloja-te-admin.duckdns.org'
    : 'http://localhost:8080');

export interface ReportColumnAdmin {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'badge' | 'date';
}

export interface ReportKPIAdmin {
  label: string;
  valor: string | number;
  subtexto?: string;
  color?: string;
}

export interface SVGChartAdmin {
  titulo: string;
  etiquetas: string[];
  valores: number[];
  formato: 'moneda' | 'numero';
}

export interface ReportQueryResultAdmin {
  columnas: ReportColumnAdmin[];
  filas: Record<string, any>[];
  totalFilas: number;
  kpis: ReportKPIAdmin[];
  grafico?: SVGChartAdmin;
  sqlEjecutado: string;
  tiempoMs: number;
  proveedorIA: string;
  consultaOriginal: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportAdminService {

  /**
   * Extrae y normaliza las tablas del Administrador a nivel nacional.
   */
  extraerTablasAdmin(contexto: any) {
    const alojamientos = (contexto.alojamientos || []).map((a: any) => ({
      idAlojamiento: a.id,
      titulo: a.titulo,
      anfitrion: a.anfitrion,
      departamento: a.departamento,
      ciudad: a.ciudad,
      tipoPropiedad: a.tipoPropiedad,
      precioNoche: a.precioNoche,
      estadoPublicacion: a.estado,
      habitaciones: a.habitaciones || (a.unidades ? a.unidades.length : 1),
      fechaRegistro: a.fechaRegistro
    }));

    const anfitriones = [
      {
        nombre: 'Carlos Mendoza Cuéllar',
        ciudad: 'Santa Cruz',
        propiedadesActivas: 3,
        verificacionLegal: 'Verificado (CI & NIT)',
        cuentaBNB: '150-0892341-01',
        totalLiquidadoBOB: 14850,
        estado: 'ACTIVO'
      },
      {
        nombre: 'Elena Morales Calbimontes',
        ciudad: 'Tarija & La Paz',
        propiedadesActivas: 2,
        verificacionLegal: 'En trámite de revisión',
        cuentaBNB: '150-0439120-02',
        totalLiquidadoBOB: 18200,
        estado: 'ACTIVO'
      },
      {
        nombre: 'Rodrigo Arce Villarroel',
        ciudad: 'Cochabamba',
        propiedadesActivas: 1,
        verificacionLegal: 'Pendiente de documentación',
        cuentaBNB: '150-0982311-03',
        totalLiquidadoBOB: 4420,
        estado: 'OBSERVADO'
      },
      {
        nombre: 'Fernando Torrico Vaca',
        ciudad: 'Santa Cruz',
        propiedadesActivas: 1,
        verificacionLegal: 'Verificado (CI & NIT)',
        cuentaBNB: '150-0771234-04',
        totalLiquidadoBOB: 7800,
        estado: 'ACTIVO'
      }
    ];

    const liquidaciones = (contexto.liquidaciones || []).map((l: any) => ({
      idLiquidacion: l.id,
      anfitrion: l.anfitrion,
      alojamiento: l.alojamiento,
      banco: l.banco,
      montoBruto: l.montoBruto,
      comisionPlataforma: l.comisionPlataforma,
      retencionImpuestos: l.retencionImpuestos,
      montoNeto: l.montoNeto,
      estado: l.estado,
      fechaLiquidacion: l.fechaLiquidacion
    }));

    const reservas = [
      {
        idReserva: 'RES-SCZ-101',
        alojamiento: 'Hotel Boutique Los Tajibos Colonial',
        departamento: 'Santa Cruz',
        huesped: 'Fernando Torrico Vaca',
        montoTotalBOB: 3400,
        comisionAlojaTe: 340,
        estado: 'CONFIRMADA',
        pinCheckin: '381920'
      },
      {
        idReserva: 'RES-SCZ-102',
        alojamiento: 'Hotel Boutique Los Tajibos Colonial',
        departamento: 'Santa Cruz',
        huesped: 'Verónica Méndez Suárez',
        montoTotalBOB: 1920,
        comisionAlojaTe: 192,
        estado: 'CONFIRMADA',
        pinCheckin: '592814'
      },
      {
        idReserva: 'RES-PLM-201',
        alojamiento: 'Cabaña Chiquitana El Palmar',
        departamento: 'Santa Cruz',
        huesped: 'Mariana Suárez Paz',
        montoTotalBOB: 1950,
        comisionAlojaTe: 195,
        estado: 'CONFIRMADA',
        pinCheckin: '142857'
      },
      {
        idReserva: 'RES-RNC-301',
        alojamiento: 'Casa de Campo La Rinconada',
        departamento: 'Santa Cruz',
        huesped: 'Rodrigo Arce Villarroel',
        montoTotalBOB: 1560,
        comisionAlojaTe: 156,
        estado: 'CONFIRMADA',
        pinCheckin: '782341'
      },
      {
        idReserva: 'RES-TRJ-401',
        alojamiento: 'Chalet Boutique Los Viñedos',
        departamento: 'Tarija',
        huesped: 'Claudio Peñaranda Durán',
        montoTotalBOB: 2340,
        comisionAlojaTe: 234,
        estado: 'CONFIRMADA',
        pinCheckin: '492018'
      },
      {
        idReserva: 'RES-LPZ-501',
        alojamiento: 'Residencial Las Retamas Sopocachi',
        departamento: 'La Paz',
        huesped: 'Lucía Suárez Paz',
        montoTotalBOB: 760,
        comisionAlojaTe: 76,
        estado: 'EXPIRADA_15MIN',
        pinCheckin: '—'
      }
    ];

    const valoraciones = (contexto.valoraciones || []).map((v: any) => ({
      huesped: v.nombreUsuario,
      puntuacion: v.puntuacionGeneral,
      topico: v.topicoPredicho || 'SERVICIO_GENERAL',
      sentimiento: v.sentimientoNlp || 'POSITIVO',
      comentario: v.comentario
    }));

    return {
      alojamientos,
      anfitriones,
      liquidaciones,
      reservas,
      valoraciones
    };
  }

  /**
   * Construye el esquema compacto en texto.
   */
  construirEsquema(tablas: any): string {
    return `
Tabla: alojamientos
  Columnas: idAlojamiento (text), titulo (text), anfitrion (text), departamento (text), ciudad (text), tipoPropiedad (text), precioNoche (number), estadoPublicacion (text), habitaciones (number)

Tabla: anfitriones
  Columnas: nombre (text), ciudad (text), propiedadesActivas (number), verificacionLegal (text), cuentaBNB (text), totalLiquidadoBOB (number), estado (text)

Tabla: liquidaciones
  Columnas: idLiquidacion (text), anfitrion (text), alojamiento (text), banco (text), montoBruto (number), comisionPlataforma (number), retencionImpuestos (number), montoNeto (number), estado (text)

Tabla: reservas
  Columnas: idReserva (text), alojamiento (text), departamento (text), huesped (text), montoTotalBOB (number), comisionAlojaTe (number), estado (text), pinCheckin (text)

Tabla: valoraciones
  Columnas: huesped (text), puntuacion (number), topico (text), sentimiento (text), comentario (text)
`.trim();
  }

  /**
   * Motor de ejecución SQL en memoria para el Administrador.
   */
  ejecutarSQL(sql: string, tablas: any): Record<string, any>[] {
    const cleanSql = sql.replace(/;/g, '').trim();

    const matchFrom = cleanSql.match(/from\s+([a-zA-Z_0-9]+)/i);
    if (!matchFrom) return tablas.alojamientos;

    const nombreTabla = matchFrom[1].toLowerCase();
    const dataset: Record<string, any>[] = (tablas as any)[nombreTabla] || tablas.alojamientos;
    if (!dataset || dataset.length === 0) return [];

    let resultados = [...dataset];

    // WHERE
    const matchWhere = cleanSql.match(/where\s+(.*?)(?=\s+order\s+by|\s+group\s+by|\s+limit|$)/i);
    if (matchWhere) {
      const clause = matchWhere[1].trim();
      resultados = resultados.filter(row => {
        try {
          const eqMatch = clause.match(/([a-zA-Z0-9_]+)\s*=\s*'([^']+)'/i);
          if (eqMatch) {
            const [, col, val] = eqMatch;
            if (String(row[col] ?? '').toLowerCase() !== val.toLowerCase()) return false;
          }

          const gtMatch = clause.match(/([a-zA-Z0-9_]+)\s*([><]=?)\s*([0-9.]+)/i);
          if (gtMatch) {
            const [, col, op, numStr] = gtMatch;
            const valNum = Number(row[col]);
            const target = Number(numStr);
            if (op === '>' && !(valNum > target)) return false;
            if (op === '>=' && !(valNum >= target)) return false;
            if (op === '<' && !(valNum < target)) return false;
            if (op === '<=' && !(valNum <= target)) return false;
          }

          const likeMatch = clause.match(/([a-zA-Z0-9_]+)\s+like\s+'%([^%']+)%'/i);
          if (likeMatch) {
            const [, col, term] = likeMatch;
            if (!String(row[col] ?? '').toLowerCase().includes(term.toLowerCase())) return false;
          }

          return true;
        } catch {
          return true;
        }
      });
    }

    // ORDER BY
    const matchOrder = cleanSql.match(/order\s+by\s+([a-zA-Z0-9_]+)(\s+desc|\s+asc)?/i);
    if (matchOrder) {
      const colOrder = matchOrder[1];
      const dir = (matchOrder[2] || 'asc').trim().toLowerCase();
      resultados.sort((a, b) => {
        const valA = a[colOrder];
        const valB = b[colOrder];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return dir === 'desc' ? valB - valA : valA - valB;
        }
        return dir === 'desc'
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      });
    }

    // SELECT (Proyección de N columnas)
    const matchSelect = cleanSql.match(/select\s+(.*?)\s+from/i);
    if (matchSelect) {
      const rawCols = matchSelect[1].trim();
      if (rawCols !== '*' && !rawCols.toLowerCase().includes('count(') && !rawCols.toLowerCase().includes('sum(')) {
        const colList = rawCols.split(',').map(c => c.trim().split(/\s+as\s+/i)[0].trim());
        resultados = resultados.map(row => {
          const proyectada: Record<string, any> = {};
          colList.forEach(c => {
            if (c in row) proyectada[c] = row[c];
          });
          return Object.keys(proyectada).length > 0 ? proyectada : row;
        });
      }
    }

    // LIMIT
    const matchLimit = cleanSql.match(/limit\s+([0-9]+)/i);
    if (matchLimit) {
      resultados = resultados.slice(0, parseInt(matchLimit[1], 10));
    }

    return resultados;
  }

  inferirColumnas(filas: Record<string, any>[]): ReportColumnAdmin[] {
    if (filas.length === 0) return [];
    const primera = filas[0];

    return Object.keys(primera).map(key => {
      const valor = primera[key];
      let type: ReportColumnAdmin['type'] = 'text';

      if (typeof valor === 'number') {
        const kLower = key.toLowerCase();
        if (kLower.includes('precio') || kLower.includes('monto') || kLower.includes('comision') || kLower.includes('neto') || kLower.includes('bruto')) {
          type = 'currency';
        } else {
          type = 'number';
        }
      } else if (key.toLowerCase().includes('estado') || key.toLowerCase().includes('verificacion')) {
        type = 'badge';
      } else if (key.toLowerCase().includes('fecha')) {
        type = 'date';
      }

      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace('Id ', '')
        .trim();

      return { key, label, type };
    });
  }

  calcularKPIs(filas: Record<string, any>[]): ReportKPIAdmin[] {
    if (filas.length === 0) return [{ label: 'Registros', valor: 0, subtexto: 'Sin datos' }];

    const kpis: ReportKPIAdmin[] = [
      {
        label: 'Registros Analizados',
        valor: filas.length,
        subtexto: 'Operaciones consolidadas a nivel Bolivia'
      }
    ];

    const colDinero = Object.keys(filas[0]).find(k => {
      const l = k.toLowerCase();
      return l.includes('monto') || l.includes('comision') || l.includes('neto') || l.includes('precio') || l.includes('bruto');
    });

    if (colDinero) {
      const suma = filas.reduce((acc, row) => acc + (Number(row[colDinero]) || 0), 0);
      const promedio = suma / filas.length;

      kpis.push({
        label: 'Monto Total Consolidado',
        valor: `Bs. ${suma.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtexto: 'Volumen financiero auditado',
        color: 'text-emerald-600 dark:text-emerald-400'
      });

      kpis.push({
        label: 'Promedio Transaccional',
        valor: `Bs. ${promedio.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtexto: 'Media por registro evaluado',
        color: 'text-blue-600 dark:text-blue-400'
      });
    }

    return kpis;
  }

  generarGrafico(filas: Record<string, any>[]): SVGChartAdmin | undefined {
    if (filas.length === 0) return undefined;

    const colEtiqueta = Object.keys(filas[0]).find(k => {
      const l = k.toLowerCase();
      return l.includes('departamento') || l.includes('ciudad') || l.includes('titulo') || l.includes('alojamiento') || l.includes('nombre') || l.includes('anfitrion');
    }) || Object.keys(filas[0])[0];

    const colValor = Object.keys(filas[0]).find(k => typeof filas[0][k] === 'number') || null;
    if (!colValor) return undefined;

    const topFilas = filas.slice(0, 8);
    const etiquetas = topFilas.map(f => String(f[colEtiqueta] || 'Item'));
    const valores = topFilas.map(f => Number(f[colValor]) || 0);

    const esMoneda = colValor.toLowerCase().includes('monto') || colValor.toLowerCase().includes('precio') || colValor.toLowerCase().includes('comision') || colValor.toLowerCase().includes('neto');

    return {
      titulo: `Comparativa Consolidada por ${colEtiqueta.toUpperCase()}`,
      etiquetas,
      valores,
      formato: esMoneda ? 'moneda' : 'numero'
    };
  }

  exportarCSV(filas: Record<string, any>[], nombreArchivo = 'reporte_admin_alojate.csv') {
    if (filas.length === 0) return;

    const columnas = Object.keys(filas[0]);
    const encabezados = columnas.map(c => `"${c.replace(/"/g, '""')}"`).join(';');

    const lineas = filas.map(row => {
      return columnas
        .map(col => {
          const val = row[col];
          if (val === null || val === undefined) return '""';
          const strVal = String(val).replace(/\r?\n/g, ' ').replace(/"/g, '""');
          return `"${strVal}"`;
        })
        .join(';');
    });

    const csvContent = '\ufeff' + [encabezados, ...lineas].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Ciclo Agéntico Multi-Turno que consulta a la API de IA (Groq / Gemini)
   * con rol ADMINISTRADOR.
   */
  async resolverReporteAdmin(queryUsuario: string, contexto: any): Promise<ReportQueryResultAdmin> {
    const t0 = performance.now();
    const tablas = this.extraerTablasAdmin(contexto);
    const schemaText = this.construirEsquema(tablas);

    let proveedor = 'Groq High-Speed IA';
    let sqlFinal = '';
    let observaciones: any[] = [];

    for (let loop = 0; loop < 2; loop++) {
      try {
        const resp = await fetch(`${API_GATEWAY_URL}/api/v1/ia/reporte-query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryUsuario,
            schema_text: schemaText,
            observations: observaciones.length > 0 ? observaciones : undefined,
            role: 'ADMINISTRADOR'
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          proveedor = data.provider || proveedor;

          if (data.action === 'CONSULTAR') {
            const expl = this.ejecutarSQL(data.sql, tablas);
            observaciones.push({ consulta: data.sql, resultado: expl.slice(0, 5) });
            continue;
          } else {
            sqlFinal = data.sql;
            break;
          }
        } else {
          throw new Error('Fallback');
        }
      } catch {
        proveedor = 'Analizador Semántico Local';
        const q = queryUsuario.toLowerCase();
        if (q.includes('comision') || q.includes('recaudaci') || q.includes('departamento')) {
          sqlFinal = 'SELECT departamento, alojamiento, montoTotalBOB, comisionAlojaTe, estado FROM reservas ORDER BY comisionAlojaTe DESC;';
        } else if (q.includes('anfitrion') || q.includes('verific') || q.includes('document')) {
          sqlFinal = 'SELECT nombre, ciudad, propiedadesActivas, verificacionLegal, cuentaBNB, estado FROM anfitriones;';
        } else if (q.includes('cancelad') || q.includes('expirad') || q.includes('15')) {
          sqlFinal = 'SELECT idReserva, alojamiento, huesped, montoTotalBOB, estado FROM reservas WHERE estado LIKE \'%EXPIRADA%\' OR estado LIKE \'%CANCELADA%\';';
        } else if (q.includes('liquidacion') || q.includes('pago') || q.includes('neto')) {
          sqlFinal = 'SELECT anfitrion, alojamiento, montoBruto, comisionPlataforma, retencionImpuestos, montoNeto, estado FROM liquidaciones;';
        } else {
          sqlFinal = 'SELECT titulo, anfitrion, departamento, ciudad, tipoPropiedad, precioNoche, estadoPublicacion FROM alojamientos;';
        }
        break;
      }
    }

    const filas = this.ejecutarSQL(sqlFinal, tablas);
    const columnas = this.inferirColumnas(filas);
    const kpis = this.calcularKPIs(filas);
    const grafico = this.generarGrafico(filas);
    const tFin = performance.now();

    return {
      columnas,
      filas,
      totalFilas: filas.length,
      kpis,
      grafico,
      sqlEjecutado: sqlFinal,
      tiempoMs: Math.round(tFin - t0),
      proveedorIA: proveedor,
      consultaOriginal: queryUsuario
    };
  }
}
