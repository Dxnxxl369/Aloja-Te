package com.alojate.usuarios.infrastructure.config;

import com.alojate.usuarios.domain.model.EstadoPublicacion;
import com.alojate.usuarios.domain.model.EstadoUnidad;
import com.alojate.usuarios.domain.model.EstadoUsuario;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.entity.*;
import com.alojate.usuarios.infrastructure.adapters.out.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SpringDataEmpresaRepository empresaRepo;
    private final SpringDataModuloRepository moduloRepo;
    private final SpringDataPermisoRepository permisoRepo;
    private final SpringDataRolRepository rolRepo;
    private final SpringDataUsuarioRepository usuarioRepo;
    private final SpringDataTipoPropiedadRepository tipoPropiedadRepo;
    private final SpringDataTipoEspacioRepository tipoEspacioRepo;
    private final SpringDataServicioRepository servicioRepo;
    private final SpringDataAlojamientoRepository alojamientoRepo;
    private final SpringDataUnidadReservableRepository unidadRepo;
    private final SpringDataFotografiaRepository fotoRepo;
    private final SpringDataValoracionRepository valoracionRepo;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    @Override
    @Transactional
    public void run(String... args) {
        log.info("[DataInitializer] Inicializando catálogos y datos base de Aloja-Te...");

        // 1. Empresa
        if (empresaRepo.count() == 0) {
            empresaRepo.save(EmpresaJpaEntity.builder()
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
                    .build());
            log.info("[DataInitializer] Empresa base creada.");
        }

        // 2. Módulos
        if (moduloRepo.count() == 0) {
            moduloRepo.save(ModuloJpaEntity.builder().nombre("Seguridad y Acceso").descripcion("Gestión de usuarios, roles y permisos").orden(1).build());
            moduloRepo.save(ModuloJpaEntity.builder().nombre("Alojamientos y Propiedades").descripcion("Publicación y administración de propiedades").orden(2).build());
            moduloRepo.save(ModuloJpaEntity.builder().nombre("Reservas y Estadías").descripcion("Orquestación de reservas").orden(3).build());
            moduloRepo.save(ModuloJpaEntity.builder().nombre("Comercial y Facturación").descripcion("Pagos QR, pasarelas y comisiones").orden(4).build());
            moduloRepo.save(ModuloJpaEntity.builder().nombre("Copiloto IA").descripcion("Revisión inteligente y búsqueda con RAG").orden(5).build());
            log.info("[DataInitializer] Módulos de sistema creados.");
        }

        // 3. Permisos
        if (permisoRepo.count() == 0) {
            crearPermisoSiNoExiste(1, "USUARIOS_VER", "Ver catálogo de usuarios", "Permite listar usuarios");
            crearPermisoSiNoExiste(1, "USUARIOS_GESTIONAR", "Administrar usuarios", "Permite suspender o cambiar roles");
            crearPermisoSiNoExiste(2, "ALOJAMIENTO_CREAR", "Crear alojamiento", "Permite registrar una propiedad");
            crearPermisoSiNoExiste(2, "ALOJAMIENTO_PUBLICAR", "Publicar alojamiento", "Permite cambiar estado a PUBLICADO");
            crearPermisoSiNoExiste(2, "ALOJAMIENTO_GESTIONAR", "Editar cualquier propiedad", "Permiso administrativo");
            crearPermisoSiNoExiste(3, "RESERVA_CREAR", "Solicitar reserva", "Permite reservar unidades");
            crearPermisoSiNoExiste(4, "PAGOS_VER", "Ver transacciones", "Auditoría financiera");
            log.info("[DataInitializer] Permisos creados.");
        }

        // 4. Roles
        RolJpaEntity rolAdmin = obtenerOCrearRol("ADMINISTRADOR", "GLOBAL", true);
        RolJpaEntity rolAnfitrion = obtenerOCrearRol("ANFITRION", "ALOJAMIENTOS", true);
        RolJpaEntity rolCliente = obtenerOCrearRol("CLIENTE", "PORTAL", true);

        // Asignar todos los permisos al Administrador
        rolAdmin.setPermisos(new HashSet<>(permisoRepo.findAll()));
        rolRepo.save(rolAdmin);

        // Asignar permisos clave a Anfitrión
        Set<PermisoJpaEntity> permisosAnfitrion = new HashSet<>();
        permisoRepo.findByCodigo("ALOJAMIENTO_CREAR").ifPresent(permisosAnfitrion::add);
        permisoRepo.findByCodigo("ALOJAMIENTO_PUBLICAR").ifPresent(permisosAnfitrion::add);
        permisoRepo.findByCodigo("RESERVA_CREAR").ifPresent(permisosAnfitrion::add);
        rolAnfitrion.setPermisos(permisosAnfitrion);
        rolRepo.save(rolAnfitrion);

        // 5. Usuario Administrador Único Oficial (Daniel Quispe Choque)
        if (!usuarioRepo.existsByEmail("danielqczn@gmail.com")) {
            usuarioRepo.save(UsuarioJpaEntity.builder()
                    .idUsuario(UUID.fromString("a0000000-0000-4000-8000-000000000001"))
                    .email("danielqczn@gmail.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .nombre("Daniel")
                    .apellido("Quispe Choque")
                    .telefono("63591455")
                    .tipoCuenta("SUPER_ADMIN")
                    .rol(rolAdmin)
                    .estado(EstadoUsuario.ACTIVO)
                    .fechaRegistro(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
            log.info("[DataInitializer] Usuario Admin creado: danielqczn@gmail.com / admin123");
        }

        // 8. Catálogo de Tipos de Propiedad
        obtenerOCrearTipoPropiedad("Cabaña Chiquitana");
        obtenerOCrearTipoPropiedad("Departamento Urbano");
        obtenerOCrearTipoPropiedad("Casa de Campo");
        obtenerOCrearTipoPropiedad("Eco-Lodge");
        obtenerOCrearTipoPropiedad("Hotel Boutique");

        // 9. Catálogo de Tipos de Espacio
        obtenerOCrearTipoEspacio("Lugar entero");
        obtenerOCrearTipoEspacio("Habitación privada");
        obtenerOCrearTipoEspacio("Habitación compartida");

        // 10. Catálogo de Servicios
        obtenerOCrearServicio("Wifi de Alta Velocidad (Starlink)", "CONECTIVIDAD");
        obtenerOCrearServicio("Piscina Privada", "CONFORT");
        obtenerOCrearServicio("Aire Acondicionado", "CONFORT");
        obtenerOCrearServicio("Parrillera / Churrasquera", "CONFORT");
        obtenerOCrearServicio("Estacionamiento Gratuito", "ACCESIBILIDAD");
        obtenerOCrearServicio("Cocina Equipada", "SERVICIOS");

        log.info("[DataInitializer] Inicialización completada con éxito. Catálogos listos, 0 propiedades creadas.");
    }

    private void crearPermisoSiNoExiste(Integer idModulo, String codigo, String nombre, String desc) {
        if (permisoRepo.findByCodigo(codigo).isEmpty()) {
            permisoRepo.save(PermisoJpaEntity.builder()
                    .idModulo(idModulo)
                    .codigo(codigo)
                    .nombre(nombre)
                    .descripcion(desc)
                    .asignable(true)
                    .build());
        }
    }

    private RolJpaEntity obtenerOCrearRol(String nombre, String ambito, boolean esSistema) {
        return rolRepo.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> rolRepo.save(RolJpaEntity.builder()
                        .nombre(nombre)
                        .ambito(ambito)
                        .esSistema(esSistema)
                        .activo(true)
                        .build()));
    }

    private TipoPropiedadJpaEntity obtenerOCrearTipoPropiedad(String nombre) {
        return tipoPropiedadRepo.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> {
                    try {
                        return tipoPropiedadRepo.save(TipoPropiedadJpaEntity.builder().nombre(nombre).build());
                    } catch (Exception e) {
                        return tipoPropiedadRepo.findByNombreIgnoreCase(nombre).orElse(null);
                    }
                });
    }

    private TipoEspacioJpaEntity obtenerOCrearTipoEspacio(String nombre) {
        return tipoEspacioRepo.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> {
                    try {
                        return tipoEspacioRepo.save(TipoEspacioJpaEntity.builder().nombre(nombre).build());
                    } catch (Exception e) {
                        return tipoEspacioRepo.findByNombreIgnoreCase(nombre).orElse(null);
                    }
                });
    }

    private ServicioJpaEntity obtenerOCrearServicio(String nombre, String categoria) {
        return servicioRepo.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> {
                    try {
                        return servicioRepo.save(ServicioJpaEntity.builder().nombre(nombre).categoria(categoria).build());
                    } catch (Exception e) {
                        return servicioRepo.findByNombreIgnoreCase(nombre).orElse(null);
                    }
                });
    }
}
