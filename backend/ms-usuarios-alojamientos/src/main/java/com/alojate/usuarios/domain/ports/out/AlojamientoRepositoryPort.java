package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Alojamiento;
import com.alojate.usuarios.domain.model.EstadoPublicacion;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface AlojamientoRepositoryPort {
    Alojamiento guardar(Alojamiento alojamiento);
    Optional<Alojamiento> buscarPorId(UUID idAlojamiento);
    List<Alojamiento> listarTodos();
    List<Alojamiento> listarPorAnfitrion(UUID idAnfitrion);
    List<Alojamiento> listarPorEstado(EstadoPublicacion estado);
    List<Alojamiento> buscarAvanzada(String ciudad, String departamento, Integer idTipoPropiedad, BigDecimal precioMax, Integer minHuespedes);
    void sincronizarServicios(UUID idAlojamiento, Set<Integer> idsServicios);
}
