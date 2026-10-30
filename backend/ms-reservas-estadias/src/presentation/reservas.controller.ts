import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ReservasService } from '../application/reservas.service';
import { CrearReservaDto } from '../application/dtos/crear-reserva.dto';
import { ConfirmarPagoDto } from '../application/dtos/confirmar-pago.dto';
import { RealizarCheckInDto } from '../application/dtos/checkin.dto';

@Controller('api/v1/reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearReserva(@Body() dto: CrearReservaDto) {
    return await this.reservasService.crearSolicitudReserva(dto);
  }

  @Get()
  async listarTodas() {
    return await this.reservasService.listarTodas();
  }

  @Get('disponibilidad/:unidadId')
  async consultarDisponibilidad(
    @Param('unidadId') unidadId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    return await this.reservasService.verificarDisponibilidad(unidadId, checkIn, checkOut);
  }

  @Get('cliente/:clienteId')
  async listarPorCliente(@Param('clienteId') clienteId: string) {
    return await this.reservasService.listarPorCliente(clienteId);
  }

  @Get('anfitrion/:anfitrionId')
  async listarPorAnfitrion(@Param('anfitrionId') anfitrionId: string) {
    return await this.reservasService.listarPorAnfitrion(anfitrionId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.reservasService.obtenerReservaPorId(id);
  }

  @Post(':id/confirmar-pago')
  async confirmarPago(@Param('id') id: string, @Body() dto: ConfirmarPagoDto) {
    return await this.reservasService.confirmarPagoSaga(id, dto);
  }

  @Post(':id/cancelar')
  async cancelarReserva(@Param('id') id: string, @Body('motivo') motivo?: string) {
    return await this.reservasService.cancelarOCompensarReserva(id, motivo || 'Cancelada por el usuario');
  }

  @Post(':id/check-in')
  async realizarCheckIn(@Param('id') id: string, @Body() dto: RealizarCheckInDto) {
    return await this.reservasService.realizarCheckIn(id, dto);
  }

  @Post(':id/check-out')
  async realizarCheckOut(@Param('id') id: string) {
    return await this.reservasService.finalizarCheckOut(id);
  }
}
