package com.alojate.usuarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class AlojateUsuariosApplication {

    public static void main(String[] args) {
        cargarVariablesEnv();
        SpringApplication.run(AlojateUsuariosApplication.class, args);
    }

    private static void cargarVariablesEnv() {
        try {
            File envFile = new File(".env");
            if (!envFile.exists()) {
                envFile = new File("backend/ms-usuarios-alojamientos/.env");
            }
            if (envFile.exists()) {
                List<String> lineas = Files.readAllLines(envFile.toPath());
                for (String linea : lineas) {
                    linea = linea.trim();
                    if (!linea.isEmpty() && !linea.startsWith("#") && linea.contains("=")) {
                        int idx = linea.indexOf('=');
                        String key = linea.substring(0, idx).trim();
                        String val = linea.substring(idx + 1).trim();
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }
}
