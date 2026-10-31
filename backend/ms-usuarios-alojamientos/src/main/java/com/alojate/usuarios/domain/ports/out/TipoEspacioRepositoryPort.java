package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.TipoEspacio;

import java.util.List;
import java.util.Optional;

public interface TipoEspacioRepositoryPort {
    TipoEspacio guardar(TipoEspacio tipo);
    Optional<TipoEspacio> buscarPorId(Integer idTipoEspacio);
    List<TipoEspacio> listarTodos();
}
