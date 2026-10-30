package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.Servicio;
import com.alojate.usuarios.domain.model.TipoEspacio;
import com.alojate.usuarios.domain.model.TipoPropiedad;

import java.util.List;

public interface CatalogoUseCase {
    List<TipoPropiedad> listarTiposPropiedad();
    TipoPropiedad crearTipoPropiedad(String nombre);

    List<TipoEspacio> listarTiposEspacio();
    TipoEspacio crearTipoEspacio(String nombre);

    List<Servicio> listarServicios();
    List<Servicio> listarServiciosPorCategoria(String categoria);
    Servicio crearServicio(String nombre, String categoria);
}
