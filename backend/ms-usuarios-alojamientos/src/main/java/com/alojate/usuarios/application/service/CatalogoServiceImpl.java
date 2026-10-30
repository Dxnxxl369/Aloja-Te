package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.model.Servicio;
import com.alojate.usuarios.domain.model.TipoEspacio;
import com.alojate.usuarios.domain.model.TipoPropiedad;
import com.alojate.usuarios.domain.ports.in.CatalogoUseCase;
import com.alojate.usuarios.domain.ports.out.ServicioRepositoryPort;
import com.alojate.usuarios.domain.ports.out.TipoEspacioRepositoryPort;
import com.alojate.usuarios.domain.ports.out.TipoPropiedadRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogoServiceImpl implements CatalogoUseCase {

    private final TipoPropiedadRepositoryPort tipoPropiedadRepo;
    private final TipoEspacioRepositoryPort tipoEspacioRepo;
    private final ServicioRepositoryPort servicioRepo;

    @Override
    @Transactional(readOnly = true)
    public List<TipoPropiedad> listarTiposPropiedad() {
        return tipoPropiedadRepo.listarTodos();
    }

    @Override
    @Transactional
    public TipoPropiedad crearTipoPropiedad(String nombre) {
        return tipoPropiedadRepo.guardar(TipoPropiedad.builder().nombre(nombre).build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoEspacio> listarTiposEspacio() {
        return tipoEspacioRepo.listarTodos();
    }

    @Override
    @Transactional
    public TipoEspacio crearTipoEspacio(String nombre) {
        return tipoEspacioRepo.guardar(TipoEspacio.builder().nombre(nombre).build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Servicio> listarServicios() {
        return servicioRepo.listarTodos();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Servicio> listarServiciosPorCategoria(String categoria) {
        return servicioRepo.listarPorCategoria(categoria);
    }

    @Override
    @Transactional
    public Servicio crearServicio(String nombre, String categoria) {
        return servicioRepo.guardar(Servicio.builder()
                .nombre(nombre)
                .categoria(categoria != null ? categoria : "GENERAL")
                .build());
    }
}
