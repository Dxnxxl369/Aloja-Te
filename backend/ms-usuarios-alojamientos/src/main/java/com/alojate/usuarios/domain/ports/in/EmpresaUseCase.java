package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.Empresa;

import java.util.List;
import java.util.UUID;

public interface EmpresaUseCase {
    Empresa registrarOActualizarEmpresa(Empresa empresa);
    Empresa obtenerEmpresaActiva();
    Empresa obtenerPorId(UUID idEmpresa);
    List<Empresa> listarEmpresas();
}
