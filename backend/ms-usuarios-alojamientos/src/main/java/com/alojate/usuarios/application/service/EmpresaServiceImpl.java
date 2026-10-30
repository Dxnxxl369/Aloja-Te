package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.exception.UsuarioYaExisteException;
import com.alojate.usuarios.domain.model.Empresa;
import com.alojate.usuarios.domain.ports.in.EmpresaUseCase;
import com.alojate.usuarios.domain.ports.out.EmpresaRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmpresaServiceImpl implements EmpresaUseCase {

    private final EmpresaRepositoryPort empresaRepositoryPort;

    @Override
    @Transactional
    public Empresa registrarOActualizarEmpresa(Empresa empresa) {
        if (empresa.getActivo() == null) {
            empresa.setActivo(true);
        }
        return empresaRepositoryPort.guardar(empresa);
    }

    @Override
    @Transactional(readOnly = true)
    public Empresa obtenerEmpresaActiva() {
        return empresaRepositoryPort.buscarEmpresaActiva()
                .orElseGet(() -> {
                    // Si no existe, crear la predeterminada
                    Empresa defaultEmpresa = Empresa.builder()
                            .razonSocial("Aloja-Te Bolivia S.R.L.")
                            .nombreComercial("Aloja-Te")
                            .nit("1029384756")
                            .representanteLegal("Carlos Mendoza")
                            .telefono("+591 3 3456789")
                            .email("contacto@alojate.bo")
                            .direccion("Av. San Martín #450, Equipetrol")
                            .ciudad("Santa Cruz de la Sierra")
                            .departamento("Santa Cruz")
                            .pais("Bolivia")
                            .logoUrl("/assets/logo.png")
                            .sitioWeb("https://alojate.bo")
                            .activo(true)
                            .build();
                    return empresaRepositoryPort.guardar(defaultEmpresa);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Empresa obtenerPorId(UUID idEmpresa) {
        return empresaRepositoryPort.buscarPorId(idEmpresa)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada con id: " + idEmpresa));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Empresa> listarEmpresas() {
        return empresaRepositoryPort.listarTodas();
    }
}
