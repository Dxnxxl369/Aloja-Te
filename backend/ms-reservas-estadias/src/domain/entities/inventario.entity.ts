export class BloqueoInventarioEntity {
  pk: string; // INVENTARIO#<idUnidad>
  sk: string; // FECHA#<YYYY-MM-DD>

  idUnidad: string;
  fecha: string; // YYYY-MM-DD
  cantidadOcupada: number;
  motivo?: string;
  idReserva?: string;
  fechaCreacion: string;

  constructor(partial: Partial<BloqueoInventarioEntity>) {
    Object.assign(this, partial);
    if (!this.pk && this.idUnidad) {
      this.pk = `INVENTARIO#${this.idUnidad}`;
      this.sk = `FECHA#${this.fecha}`;
    }
  }
}
