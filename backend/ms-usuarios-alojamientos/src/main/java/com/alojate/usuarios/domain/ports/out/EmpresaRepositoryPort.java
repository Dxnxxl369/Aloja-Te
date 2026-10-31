package com.alojate.usuarios.domain.ports.out;

import com.alojate.usuarios.domain.model.Empresa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmpresaRepositoryPort {
    Empresa guardar(Empresa empresa);
    Optional<Empresa> buscarPorId(UUID idEmpresa);
    Optional<Empresa> buscarEmpresaActiva();
    List<Empresa> listarTodas();
}
