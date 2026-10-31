package com.alojate.usuarios.infrastructure.adapters.out.security;

import com.alojate.usuarios.domain.model.Usuario;
import com.alojate.usuarios.domain.ports.out.TokenServicePort;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtTokenAdapter implements TokenServicePort {

    private final Algorithm algorithm;
    private final String issuer;
    private final long expirationHours;

    public JwtTokenAdapter(
            @Value("${jwt.secret:alojate-bolivia-secret-key-super-secure-production-2026}") String secret,
            @Value("${jwt.issuer:alojate-auth-service}") String issuer,
            @Value("${jwt.expiration-hours:24}") long expirationHours) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.issuer = issuer;
        this.expirationHours = expirationHours;
    }

    @Override
    public String generarToken(Usuario usuario) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationHours, ChronoUnit.HOURS);
        String subject = usuario.getIdUsuario() != null ? usuario.getIdUsuario().toString() : "";
        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : "CLIENTE";
        String estadoNombre = usuario.getEstado() != null ? usuario.getEstado().name() : "ACTIVO";

        return JWT.create()
                .withIssuer(issuer)
                .withSubject(subject)
                .withClaim("email", usuario.getEmail())
                .withClaim("nombre", usuario.getNombre() + " " + (usuario.getApellido() != null ? usuario.getApellido() : ""))
                .withClaim("rol", rolNombre)
                .withClaim("estado", estadoNombre)
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .sign(algorithm);
    }

    @Override
    public boolean validarToken(String token) {
        try {
            JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build()
                    .verify(token);
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }

    @Override
    public String extraerEmail(String token) {
        DecodedJWT jwt = JWT.decode(token);
        return jwt.getClaim("email").asString();
    }

    @Override
    public String extraerRol(String token) {
        DecodedJWT jwt = JWT.decode(token);
        return jwt.getClaim("rol").asString();
    }
}
