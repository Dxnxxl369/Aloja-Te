package com.alojate.usuarios.domain.ports.in;

import com.alojate.usuarios.domain.model.EstadoUsuario;
import com.alojate.usuarios.domain.model.Usuario;

import java.util.List;
import java.util.UUID;

public interface UsuarioUseCase {
    Usuario obtenerPorId(UUID id);
    Usuario obtenerPorEmail(String email);
    List<Usuario> listarTodos();
    Usuario actualizarPerfil(UUID id, String nombre, String apellido, String telefono);
    Usuario actualizarCuentaBancaria(UUID id, String bancoNombre, String numeroCuentaBancaria, String qr);
    Usuario actualizarCuentaBancariaPorEmail(String email, String bancoNombre, String numeroCuentaBancaria, String qr);
    Usuario cambiarEstado(UUID id, EstadoUsuario nuevoEstado);
}
