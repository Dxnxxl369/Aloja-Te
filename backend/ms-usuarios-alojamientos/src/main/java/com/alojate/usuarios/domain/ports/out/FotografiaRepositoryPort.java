package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Fotografia;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FotografiaRepositoryPort {
    Fotografia guardar(Fotografia fotografia);
    Optional<Fotografia> buscarPorId(UUID idFotografia);
    List<Fotografia> listarPorAlojamiento(UUID idAlojamiento);
    List<Fotografia> listarPorUnidad(UUID idUnidad);
    void eliminarPorUnidad(UUID idUnidad);
    void eliminarPorId(UUID idFotografia);
}
