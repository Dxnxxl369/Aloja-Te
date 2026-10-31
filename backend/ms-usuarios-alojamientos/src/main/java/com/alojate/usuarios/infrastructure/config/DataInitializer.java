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

        // 5. Usuario Administrador por defecto
        if (!usuarioRepo.existsByEmail("admin@alojate.bo")) {
            usuarioRepo.save(UsuarioJpaEntity.builder()
                    .email("admin@alojate.bo")
                    .passwordHash(passwordEncoder.encode("Admin1234!"))
                    .nombre("Administrador")
                    .apellido("General")
                    .ci("1234567")
                    .ciExpedido("SCZ")
                    .telefono("+591 70000000")
                    .tipoCuenta("ADMIN_GLOBAL")
                    .rol(rolAdmin)
                    .estado(EstadoUsuario.ACTIVO)
                    .fechaRegistro(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
            log.info("[DataInitializer] Usuario Admin creado: admin@alojate.bo / Admin1234!");
        }

        // 6. Usuarios Anfitriones
        UsuarioJpaEntity anfitrionDefault = null;
        if (!usuarioRepo.existsByEmail("anfitrion@alojate.bo")) {
            anfitrionDefault = usuarioRepo.save(UsuarioJpaEntity.builder()
                    .email("anfitrion@alojate.bo")
                    .passwordHash(passwordEncoder.encode("Anfitrion1234!"))
                    .nombre("Mateo")
                    .apellido("Justiniano")
                    .ci("7654321")
                    .ciExpedido("SCZ")
                    .telefono("+591 71098765")
                    .tipoCuenta("ANFITRION_VERIFICADO")
                    .rol(rolAnfitrion)
                    .estado(EstadoUsuario.ACTIVO)
                    .bancoNombre("Banco Nacional de Bolivia (BNB)")
                    .numeroCuentaBancaria("2000123456789")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
            log.info("[DataInitializer] Usuario Anfitrión creado: anfitrion@alojate.bo / Anfitrion1234!");
        } else {
            anfitrionDefault = usuarioRepo.findByEmail("anfitrion@alojate.bo").orElse(null);
        }

        if (!usuarioRepo.existsByEmail("carlos.mendoza@alojate.bo")) {
            usuarioRepo.save(UsuarioJpaEntity.builder()
                    .email("carlos.mendoza@alojate.bo")
                    .passwordHash(passwordEncoder.encode("Bolivia2026!"))
                    .nombre("Carlos")
                    .apellido("Mendoza")
                    .ci("4829103")
                    .ciExpedido("SCZ")
                    .telefono("+591 78012345")
                    .tipoCuenta("ANFITRION_VERIFICADO")
                    .rol(rolAnfitrion)
                    .estado(EstadoUsuario.ACTIVO)
                    .bancoNombre("Banco Mercantil Santa Cruz (BMSC)")
                    .numeroCuentaBancaria("4010987654321")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
            log.info("[DataInitializer] Usuario Anfitrión creado: carlos.mendoza@alojate.bo / Bolivia2026!");
        }

        if (!usuarioRepo.existsByEmail("anfitrion.pendiente@alojate.bo")) {
            usuarioRepo.save(UsuarioJpaEntity.builder()
                    .email("anfitrion.pendiente@alojate.bo")
                    .passwordHash(passwordEncoder.encode("Bolivia2026!"))
                    .nombre("Roberto")
                    .apellido("Aguilera")
                    .ci("6543210")
                    .ciExpedido("LPZ")
                    .telefono("+591 76543210")
                    .tipoCuenta("ANFITRION_PENDIENTE")
                    .rol(rolAnfitrion)
                    .estado(EstadoUsuario.PENDIENTE_VERIFICACION)
                    .fechaRegistro(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
            log.info("[DataInitializer] Usuario Anfitrión Pendiente creado: anfitrion.pendiente@alojate.bo / Bolivia2026!");
        }

        // 7. Usuarios Clientes (Huéspedes / Viajeros)
        if (!usuarioRepo.existsByEmail("cliente@alojate.bo")) {
            usuarioRepo.save(UsuarioJpaEntity.builder()
                    .email("cliente@alojate.bo")
                    .passwordHash(passwordEncoder.encode("Cliente1234!"))
                    .nombre("Lucia")
                    .apellido("Suarez")
                    .ci("5432198")
                    .ciExpedido("SCZ")
                    .telefono("+591 77012345")
                    .tipoCuenta("VIAJERO_FRECUENTE")
                    .rol(rolCliente)
                    .estado(EstadoUsuario.ACTIVO)
                    .fechaRegistro(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
            log.info("[DataInitializer] Usuario Cliente creado: cliente@alojate.bo / Cliente1234!");
        }

        if (!usuarioRepo.existsByEmail("lucia.suarez@alojate.bo")) {
            usuarioRepo.save(UsuarioJpaEntity.builder()
                    .email("lucia.suarez@alojate.bo")
                    .passwordHash(passwordEncoder.encode("Bolivia2026!"))
                    .nombre("Lucia")
                    .apellido("Suarez")
                    .ci("5432198")
                    .ciExpedido("SCZ")
                    .telefono("+591 77012345")
                    .tipoCuenta("VIAJERO_FRECUENTE")
                    .rol(rolCliente)
                    .estado(EstadoUsuario.ACTIVO)
                    .fechaRegistro(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
            log.info("[DataInitializer] Usuario Cliente creado: lucia.suarez@alojate.bo / Bolivia2026!");
        }

        // 7. Catálogo de Tipos de Propiedad
        TipoPropiedadJpaEntity tipoCabana = obtenerOCrearTipoPropiedad("Cabaña Chiquitana");
        obtenerOCrearTipoPropiedad("Departamento Urbano");
        obtenerOCrearTipoPropiedad("Casa de Campo");
        obtenerOCrearTipoPropiedad("Eco-Lodge");
        obtenerOCrearTipoPropiedad("Hotel Boutique");

        // 8. Catálogo de Tipos de Espacio
        TipoEspacioJpaEntity espacioEntero = obtenerOCrearTipoEspacio("Lugar entero");
        obtenerOCrearTipoEspacio("Habitación privada");
        obtenerOCrearTipoEspacio("Habitación compartida");

        // 9. Catálogo de Servicios
        ServicioJpaEntity sWifi = obtenerOCrearServicio("Wifi de Alta Velocidad (Starlink)", "CONECTIVIDAD");
        ServicioJpaEntity sPiscina = obtenerOCrearServicio("Piscina Privada", "CONFORT");
        ServicioJpaEntity sAC = obtenerOCrearServicio("Aire Acondicionado", "CONFORT");
        ServicioJpaEntity sParrilla = obtenerOCrearServicio("Parrillera / Churrasquera", "CONFORT");
        ServicioJpaEntity sParking = obtenerOCrearServicio("Estacionamiento Gratuito", "ACCESIBILIDAD");
        ServicioJpaEntity sCocina = obtenerOCrearServicio("Cocina Equipada", "SERVICIOS");

        // 10. Alojamiento de demostración si la base está vacía
        if (alojamientoRepo.count() == 0 && anfitrionDefault != null) {
            Set<ServicioJpaEntity> serviciosSample = new HashSet<>(Arrays.asList(sWifi, sPiscina, sAC, sParrilla, sParking, sCocina));

            AlojamientoJpaEntity alojDemo = AlojamientoJpaEntity.builder()
                    .idAnfitrion(anfitrionDefault.getIdUsuario())
                    .tipoPropiedad(tipoCabana)
                    .modalidad("CASA_DEPARTAMENTO")
                    .politicas("Prohibido fumar en interiores. Mascotas permitidas en jardín. Check-in 14:00 - Check-out 11:00.")
                    .horarioEntrada("14:00")
                    .horarioSalida("11:00")
                    .titulo("Cabaña Chiquitana El Palmar — Chiquitanía Mágica")
                    .descripcion("Hermosa cabaña rústica colonial con piscina privada, galería con hamacas y cielo estrellado en el corazón de la Chiquitanía boliviana.")
                    .direccion("Camino a San José Km 5")
                    .ciudad("San José de Chiquitos")
                    .departamento("Santa Cruz")
                    .latitud(new BigDecimal("-17.8441000"))
                    .longitud(new BigDecimal("-60.7422000"))
                    .estadoPublicacion(EstadoPublicacion.PUBLICADO)
                    .fechaCreacion(LocalDateTime.now())
                    .servicios(serviciosSample)
                    .build();

            AlojamientoJpaEntity alojGuardado = alojamientoRepo.save(alojDemo);

            // Unidad Reservable única (Casa completa)
            unidadRepo.save(UnidadReservableJpaEntity.builder()
                    .idAlojamiento(alojGuardado.getIdAlojamiento())
                    .tipoEspacio(espacioEntero)
                    .nombre("Cabaña Completa (Master Suite + 2 Dormitorios)")
                    .capacidadHuespedes(8)
                    .cantidadDormitorios(3)
                    .cantidadCamas(5)
                    .cantidadBanos(new BigDecimal("2.5"))
                    .inventarioTotal(1)
                    .precioNoche(new BigDecimal("650.00"))
                    .estado(EstadoUnidad.DISPONIBLE)
                    .build());

            // Fotografías Cabaña
            fotoRepo.save(FotografiaJpaEntity.builder()
                    .idAlojamiento(alojGuardado.getIdAlojamiento())
                    .url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80")
                    .orden(1)
                    .build());
            fotoRepo.save(FotografiaJpaEntity.builder()
                    .idAlojamiento(alojGuardado.getIdAlojamiento())
                    .url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80")
                    .orden(2)
                    .build());

            // 11. Sembrar un Hotel con Múltiples Habitaciones e Inventario
            TipoPropiedadJpaEntity tipoHotel = obtenerOCrearTipoPropiedad("Hotel Boutique");
            TipoEspacioJpaEntity espacioHabitacion = obtenerOCrearTipoEspacio("Habitación privada");

            AlojamientoJpaEntity hotelDemo = AlojamientoJpaEntity.builder()
                    .idAnfitrion(anfitrionDefault.getIdUsuario())
                    .tipoPropiedad(tipoHotel)
                    .modalidad("HOTEL_HOSTAL")
                    .politicas("Recepción 24 horas. Desayuno buffet incluido de 07:00 a 10:30. No se admiten fiestas.")
                    .horarioEntrada("15:00")
                    .horarioSalida("12:00")
                    .titulo("Hotel Boutique Los Tajibos Colonial")
                    .descripcion("Exclusivo hotel boutique con arquitectura chiquitana, restaurante gourmet, spa y áreas verdes tropicales.")
                    .direccion("Av. San Martín #120, Barrio Equipetrol")
                    .ciudad("Santa Cruz de la Sierra")
                    .departamento("Santa Cruz")
                    .latitud(new BigDecimal("-17.7712000"))
                    .longitud(new BigDecimal("-63.1956000"))
                    .estadoPublicacion(EstadoPublicacion.PUBLICADO)
                    .fechaCreacion(LocalDateTime.now())
                    .servicios(serviciosSample)
                    .build();

            AlojamientoJpaEntity hotelGuardado = alojamientoRepo.save(hotelDemo);

            // Habitación 1: Suite Presidencial con Balcón (Inventario: 3)
            UnidadReservableJpaEntity uSuite = unidadRepo.save(UnidadReservableJpaEntity.builder()
                    .idAlojamiento(hotelGuardado.getIdAlojamiento())
                    .tipoEspacio(espacioHabitacion)
                    .nombre("Suite Presidencial con Balcón & Vista a Jardines")
                    .capacidadHuespedes(2)
                    .cantidadDormitorios(1)
                    .cantidadCamas(1)
                    .cantidadBanos(new BigDecimal("1.5"))
                    .inventarioTotal(3) // Múltiples unidades
                    .precioNoche(new BigDecimal("950.00"))
                    .estado(EstadoUnidad.DISPONIBLE)
                    .build());

            // Habitación 2: Habitación Ejecutiva Doble (Inventario: 12)
            UnidadReservableJpaEntity uDoble = unidadRepo.save(UnidadReservableJpaEntity.builder()
                    .idAlojamiento(hotelGuardado.getIdAlojamiento())
                    .tipoEspacio(espacioHabitacion)
                    .nombre("Habitación Ejecutiva Doble Twin")
                    .capacidadHuespedes(2)
                    .cantidadDormitorios(1)
                    .cantidadCamas(2)
                    .cantidadBanos(new BigDecimal("1.0"))
                    .inventarioTotal(12) // Múltiples unidades
                    .precioNoche(new BigDecimal("480.00"))
                    .estado(EstadoUnidad.DISPONIBLE)
                    .build());

            // Fotografías Hotel
            fotoRepo.save(FotografiaJpaEntity.builder()
                    .idAlojamiento(hotelGuardado.getIdAlojamiento())
                    .url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80")
                    .orden(1)
                    .build());
            fotoRepo.save(FotografiaJpaEntity.builder()
                    .idAlojamiento(hotelGuardado.getIdAlojamiento())
                    .url("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80")
                    .orden(2)
                    .build());

            // 12. Sembrar Propiedad EN REVISIÓN para la Bandeja de Moderación del Administrador
            TipoPropiedadJpaEntity tipoCasa = obtenerOCrearTipoPropiedad("Casa de Campo");
            AlojamientoJpaEntity alojEnRevision = AlojamientoJpaEntity.builder()
                    .idAnfitrion(anfitrionDefault.getIdUsuario())
                    .tipoPropiedad(tipoCasa)
                    .modalidad("CASA_DEPARTAMENTO")
                    .politicas("Ambiente familiar y ecoturismo. Check-in 13:00.")
                    .horarioEntrada("13:00")
                    .horarioSalida("11:00")
                    .titulo("Casa de Campo La Rinconada — Valles Cruceños")
                    .descripcion("Casa campestre con huerto orgánico, vista panorámica a las colinas de Samaipata y fogatero exterior.")
                    .direccion("Km 12 Camino a La Pajcha")
                    .ciudad("Samaipata")
                    .departamento("Santa Cruz")
                    .latitud(new BigDecimal("-18.1812000"))
                    .longitud(new BigDecimal("-63.8765000"))
                    .estadoPublicacion(EstadoPublicacion.EN_REVISION) // ¡EN REVISIÓN para Moderación!
                    .fechaCreacion(LocalDateTime.now())
                    .servicios(serviciosSample)
                    .build();

            AlojamientoJpaEntity revGuardado = alojamientoRepo.save(alojEnRevision);

            unidadRepo.save(UnidadReservableJpaEntity.builder()
                    .idAlojamiento(revGuardado.getIdAlojamiento())
                    .tipoEspacio(espacioEntero)
                    .nombre("Casa de Campo Completa con Fogata")
                    .capacidadHuespedes(6)
                    .cantidadDormitorios(2)
                    .cantidadCamas(4)
                    .cantidadBanos(new BigDecimal("2.0"))
                    .inventarioTotal(1)
                    .precioNoche(new BigDecimal("520.00"))
                    .estado(EstadoUnidad.DISPONIBLE)
                    .build());

            fotoRepo.save(FotografiaJpaEntity.builder()
                    .idAlojamiento(revGuardado.getIdAlojamiento())
                    .url("https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80")
                    .orden(1)
                    .build());

            log.info("[DataInitializer] Alojamiento demo creado: Cabaña Chiquitana El Palmar (CASA_DEPARTAMENTO)");
            log.info("[DataInitializer] Hotel demo creado: Hotel Boutique Los Tajibos Colonial (HOTEL_HOSTAL)");
            log.info("[DataInitializer] Alojamiento en moderación creado: Casa de Campo La Rinconada (EN_REVISION)");

            // 13. Sembrar Valoraciones y Reseñas con 5 Atributos y NLP
            UsuarioJpaEntity clienteDefault = usuarioRepo.findByEmail("cliente@alojate.bo").orElse(null);
            if (valoracionRepo.count() == 0 && clienteDefault != null) {
                // Reseña 1 Casa: Pública, 5 estrellas
                valoracionRepo.save(ValoracionJpaEntity.builder()
                        .idAlojamiento(alojGuardado.getIdAlojamiento())
                        .idUsuario(clienteDefault.getIdUsuario())
                        .puntuacionGeneral(5)
                        .calificacionLimpieza(5)
                        .calificacionUbicacion(5)
                        .calificacionCalidadPrecio(5)
                        .calificacionServicio(5)
                        .calificacionComodidad(5)
                        .esAnonimo(false)
                        .comentario("La cabaña superó nuestras expectativas. Todo impecable, el entorno natural es bellísimo y la atención del anfitrión fue excelente.")
                        .sentimientoNlp("POSITIVO")
                        .confianzaNlp(new BigDecimal("0.9850"))
                        .topicoPredicho("Comodidad")
                        .fechaCreacion(LocalDateTime.now().minusDays(10))
                        .build());

                // Reseña 2 Casa: Anónima, 4 estrellas
                valoracionRepo.save(ValoracionJpaEntity.builder()
                        .idAlojamiento(alojGuardado.getIdAlojamiento())
                        .idUsuario(clienteDefault.getIdUsuario())
                        .puntuacionGeneral(4)
                        .calificacionLimpieza(4)
                        .calificacionUbicacion(5)
                        .calificacionCalidadPrecio(4)
                        .calificacionServicio(5)
                        .calificacionComodidad(4)
                        .esAnonimo(true)
                        .comentario("Muy buena ubicación cerca del pueblo y lugar tranquilo. El wifi es un poco inestable por la zona pero desconectar vino bien.")
                        .sentimientoNlp("POSITIVO")
                        .confianzaNlp(new BigDecimal("0.8920"))
                        .topicoPredicho("Ubicación")
                        .fechaCreacion(LocalDateTime.now().minusDays(3))
                        .build());

                // Reseña 3 Hotel General (idUnidad == null)
                valoracionRepo.save(ValoracionJpaEntity.builder()
                        .idAlojamiento(hotelGuardado.getIdAlojamiento())
                        .idUnidad(null) // Reseña del Hotel en general
                        .idUsuario(clienteDefault.getIdUsuario())
                        .puntuacionGeneral(5)
                        .calificacionLimpieza(5)
                        .calificacionUbicacion(5)
                        .calificacionCalidadPrecio(4)
                        .calificacionServicio(5)
                        .calificacionComodidad(5)
                        .esAnonimo(false)
                        .comentario("El desayuno buffet del hotel es de primer nivel y la piscina tropical increíble. El personal de recepción muy amable y atento.")
                        .sentimientoNlp("POSITIVO")
                        .confianzaNlp(new BigDecimal("0.9740"))
                        .topicoPredicho("Atención/Desayuno")
                        .fechaCreacion(LocalDateTime.now().minusDays(7))
                        .build());

                // Reseña 4 Hotel Habitación Suite (idUnidad == uSuite.getIdUnidad())
                valoracionRepo.save(ValoracionJpaEntity.builder()
                        .idAlojamiento(hotelGuardado.getIdAlojamiento())
                        .idUnidad(uSuite.getIdUnidad()) // Reseña específica de la Suite
                        .idUsuario(clienteDefault.getIdUsuario())
                        .puntuacionGeneral(5)
                        .calificacionLimpieza(5)
                        .calificacionUbicacion(5)
                        .calificacionCalidadPrecio(5)
                        .calificacionServicio(5)
                        .calificacionComodidad(5)
                        .esAnonimo(false)
                        .comentario("La cama king size de esta suite es una nube. El balcón privado con vista a los jardines coloniales fue lo mejor de nuestra estadía.")
                        .sentimientoNlp("POSITIVO")
                        .confianzaNlp(new BigDecimal("0.9910"))
                        .topicoPredicho("Confort/Cama")
                        .fechaCreacion(LocalDateTime.now().minusDays(4))
                        .build());

                // Reseña 5 Hotel Habitación Doble (idUnidad == uDoble.getIdUnidad()) - Anónima
                valoracionRepo.save(ValoracionJpaEntity.builder()
                        .idAlojamiento(hotelGuardado.getIdAlojamiento())
                        .idUnidad(uDoble.getIdUnidad()) // Reseña específica de la Habitación Doble
                        .idUsuario(clienteDefault.getIdUsuario())
                        .puntuacionGeneral(4)
                        .calificacionLimpieza(5)
                        .calificacionUbicacion(4)
                        .calificacionCalidadPrecio(4)
                        .calificacionServicio(4)
                        .calificacionComodidad(4)
                        .esAnonimo(true)
                        .comentario("Habitación espaciosa y limpia con excelente aire acondicionado y ducha con buena presión. Muy recomendable para viajes de trabajo.")
                        .sentimientoNlp("POSITIVO")
                        .confianzaNlp(new BigDecimal("0.9340"))
                        .topicoPredicho("Limpieza/Ducha")
                        .fechaCreacion(LocalDateTime.now().minusDays(1))
                        .build());

                log.info("[DataInitializer] Reseñas y valoraciones sembradas (Casa, Hotel general y Habitaciones).");
            }
        }

        log.info("[DataInitializer] Inicialización completada con éxito.");
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
                .orElseGet(() -> tipoPropiedadRepo.save(TipoPropiedadJpaEntity.builder().nombre(nombre).build()));
    }

    private TipoEspacioJpaEntity obtenerOCrearTipoEspacio(String nombre) {
        return tipoEspacioRepo.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> tipoEspacioRepo.save(TipoEspacioJpaEntity.builder().nombre(nombre).build()));
    }

    private ServicioJpaEntity obtenerOCrearServicio(String nombre, String categoria) {
        return servicioRepo.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> servicioRepo.save(ServicioJpaEntity.builder().nombre(nombre).categoria(categoria).build()));
    }
}
