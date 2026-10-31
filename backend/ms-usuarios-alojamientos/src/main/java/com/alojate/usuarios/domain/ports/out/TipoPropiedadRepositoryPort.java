package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.TipoPropiedad;

import java.util.List;
import java.util.Optional;

public interface TipoPropiedadRepositoryPort {
    TipoPropiedad guardar(TipoPropiedad tipo);
    Optional<TipoPropiedad> buscarPorId(Integer idTipoPropiedad);
    List<TipoPropiedad> listarTodos();
}
