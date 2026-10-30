package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.exception.AccesoDenegadoException;
import com.alojate.usuarios.domain.exception.CredencialesInvalidasException;
import com.alojate.usuarios.domain.exception.UsuarioYaExisteException;
import com.alojate.usuarios.domain.model.EstadoUsuario;
import com.alojate.usuarios.domain.model.Rol;
import com.alojate.usuarios.domain.model.Usuario;
import com.alojate.usuarios.domain.ports.in.AuthResult;
import com.alojate.usuarios.domain.ports.in.AuthUseCase;
import com.alojate.usuarios.domain.ports.in.LoginCommand;
import com.alojate.usuarios.domain.ports.in.RegistrarUsuarioCommand;
import com.alojate.usuarios.domain.ports.out.PasswordEncoderPort;
import com.alojate.usuarios.domain.ports.out.RolRepositoryPort;
import com.alojate.usuarios.domain.ports.out.TokenServicePort;
import com.alojate.usuarios.domain.ports.out.UsuarioRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase {

    private final UsuarioRepositoryPort usuarioRepository;
    private final RolRepositoryPort rolRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final TokenServicePort tokenService;

    @Override
    @Transactional
    public AuthResult registrar(RegistrarUsuarioCommand command) {
        if (usuarioRepository.existePorEmail(command.getEmail())) {
            throw new UsuarioYaExisteException("El correo electrónico " + command.getEmail() + " ya está registrado en Aloja-Te.");
        }

        if (command.getCi() != null && !command.getCi().isBlank() && usuarioRepository.existePorCi(command.getCi())) {
            throw new UsuarioYaExisteException("El documento de identidad " + command.getCi() + " ya se encuentra en uso.");
        }

        // Validación de rol en autoregistro: solo CLIENTE o ANFITRION
        String nombreRol = command.getRol();
        if (nombreRol != null && (nombreRol.equalsIgnoreCase("ADMIN") || nombreRol.equalsIgnoreCase("ADMINISTRADOR"))) {
            throw new AccesoDenegadoException("El rol Administrador no puede ser asignado mediante autoregistro público.");
        }
        if (nombreRol == null || nombreRol.isBlank()) {
            nombreRol = "CLIENTE";
        }
        final String rolParaGuardar = nombreRol.toUpperCase();

        Rol rolAsignado = rolRepository.buscarPorNombre(rolParaGuardar)
                .orElseGet(() -> rolRepository.guardar(Rol.builder()
                        .nombre(rolParaGuardar)
                        .ambito("GLOBAL")
                        .esSistema(true)
                        .activo(true)
                        .build()));

        // Estado según rol: Anfitrión requiere verificación de C.I. SEGIP posterior
        boolean esAnfitrion = "ANFITRION".equalsIgnoreCase(nombreRol);
        EstadoUsuario estadoInicial = esAnfitrion
                ? EstadoUsuario.PENDIENTE_VERIFICACION
                : EstadoUsuario.ACTIVO;

        Usuario nuevoUsuario = Usuario.builder()
                .email(command.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.codificar(command.getPassword()))
                .nombre(command.getNombre().trim())
                .apellido(command.getApellido() != null ? command.getApellido().trim() : "")
                .ci(command.getCi() != null ? command.getCi().trim() : null)
                .ciComplemento(command.getCiComplemento() != null ? command.getCiComplemento().trim().toUpperCase() : null)
                .ciExpedido(command.getCiExpedido() != null ? command.getCiExpedido().trim().toUpperCase() : null)
                .telefono(command.getTelefono() != null ? command.getTelefono().trim() : null)
                .telefonoEmergencia(command.getTelefonoEmergencia() != null ? command.getTelefonoEmergencia().trim() : null)
                .direccionDomicilio(command.getDireccionDomicilio() != null ? command.getDireccionDomicilio().trim() : null)
                .departamentoRadicatoria(command.getDepartamentoRadicatoria() != null ? command.getDepartamentoRadicatoria().trim() : null)
                .bancoNombre(command.getBancoNombre() != null ? command.getBancoNombre().trim() : null)
                .numeroCuentaBancaria(command.getNumeroCuentaBancaria() != null ? command.getNumeroCuentaBancaria().trim() : null)
                .tipoCuenta(command.getTipoCuenta() != null ? command.getTipoCuenta() : (esAnfitrion ? "ANFITRION" : "PERSONAL"))
                .idRol(rolAsignado.getIdRol())
                .rol(rolAsignado)
                .estado(estadoInicial)
                .fechaRegistro(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();

        Usuario usuarioGuardado = usuarioRepository.guardar(nuevoUsuario);
        String token = tokenService.generarToken(usuarioGuardado);

        String mensaje = esAnfitrion
                ? "Registro exitoso. Tu cuenta de Anfitrión está sujeta a verificación de identidad SEGIP (F01)."
                : "Registro exitoso. Bienvenido a Aloja-Te.";

        return AuthResult.builder()
                .token(token)
                .usuarioId(usuarioGuardado.getIdUsuario())
                .email(usuarioGuardado.getEmail())
                .nombreCompleto(usuarioGuardado.getNombre() + " " + usuarioGuardado.getApellido())
                .rol(rolAsignado.getNombre())
                .estado(usuarioGuardado.getEstado())
                .mensaje(mensaje)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResult autenticar(LoginCommand command) {
        Usuario usuario = usuarioRepository.buscarPorEmail(command.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new CredencialesInvalidasException("Credenciales incorrectas. Verifique su correo y contraseña."));

        if (!passwordEncoder.coincide(command.getPassword(), usuario.getPasswordHash())) {
            throw new CredencialesInvalidasException("Credenciales incorrectas. Verifique su correo y contraseña.");
        }

        if (usuario.getEstado() == EstadoUsuario.SUSPENDIDO) {
            throw new AccesoDenegadoException("Su cuenta ha sido suspendida por incumplimiento de políticas de la plataforma.");
        }

        // Verificación de acceso al portal administrativo
        if (command.getPortalEsperado() != null && command.getPortalEsperado().equalsIgnoreCase("ADMINISTRADOR")) {
            if (!usuario.esAdministrador()) {
                throw new AccesoDenegadoException("Acceso restringido: El usuario no cuenta con privilegios de Administrador para este portal.");
            }
        }

        String token = tokenService.generarToken(usuario);
        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : "CLIENTE";

        return AuthResult.builder()
                .token(token)
                .usuarioId(usuario.getIdUsuario())
                .email(usuario.getEmail())
                .nombreCompleto(usuario.getNombre() + " " + usuario.getApellido())
                .rol(rolNombre)
                .estado(usuario.getEstado())
                .mensaje("Autenticación exitosa.")
                .build();
    }
}
