package com.alojate.usuarios.application.service;

import com.alojate.usuarios.domain.exception.UsuarioYaExisteException;
import com.alojate.usuarios.domain.model.EstadoUsuario;
import com.alojate.usuarios.domain.model.Usuario;
import com.alojate.usuarios.domain.ports.in.UsuarioUseCase;
import com.alojate.usuarios.domain.ports.out.UsuarioRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioUseCase {

    private final UsuarioRepositoryPort usuarioRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public Usuario obtenerPorId(UUID id) {
        return usuarioRepositoryPort.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Usuario obtenerPorEmail(String email) {
        return usuarioRepositoryPort.buscarPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepositoryPort.listarTodos();
    }

    @Override
    @Transactional
    public Usuario actualizarPerfil(UUID id, String nombre, String apellido, String telefono) {
        Usuario usuario = obtenerPorId(id);
        if (nombre != null && !nombre.isBlank()) usuario.setNombre(nombre);
        if (apellido != null) usuario.setApellido(apellido);
        if (telefono != null) usuario.setTelefono(telefono);
        usuario.setFechaActualizacion(LocalDateTime.now());
        return usuarioRepositoryPort.guardar(usuario);
    }

    @Override
    @Transactional
    public Usuario cambiarEstado(UUID id, EstadoUsuario nuevoEstado) {
        Usuario usuario = obtenerPorId(id);
        usuario.setEstado(nuevoEstado);
        usuario.setFechaActualizacion(LocalDateTime.now());
        return usuarioRepositoryPort.guardar(usuario);
    }
}
