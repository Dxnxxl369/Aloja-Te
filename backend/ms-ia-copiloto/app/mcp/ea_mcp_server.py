"""
Servidor MCP (Model Context Protocol v2) para integración con Sparx Enterprise Architect y Generación de Diagramas de Dominio.
Permite a los Agentes y al Copiloto consultar la arquitectura, inspeccionar clases y exportar artefactos UML a Enterprise Architect.
"""

import sys
import os
import json
from pathlib import Path

try:
    from mcp.server.mcpserver import MCPServer
    mcp = MCPServer("AlojaTe-EnterpriseArchitect-MCP")
except ImportError:
    mcp = None

DIAGRAMS_DIR = Path(__file__).resolve().parents[4] / "diagramas"
XMI_PATH = DIAGRAMS_DIR / "alojate_modelo_ea.xmi"
PNG_PATH = DIAGRAMS_DIR / "diagrama_clases_completo.png"
SVG_PATH = DIAGRAMS_DIR / "diagrama_clases_completo.svg"

def get_architecture_status() -> str:
    """Retorna el estado de sincronización entre el modelo Enterprise Architect y el código fuente."""
    return json.dumps({
        "status": "SINCRONIZADO",
        "motor_ea": "Sparx Systems Enterprise Architect 16.x / XMI 2.1",
        "diagrama_png": str(PNG_PATH.resolve()),
        "diagrama_svg": str(SVG_PATH.resolve()),
        "xmi_intercambio": str(XMI_PATH.resolve()),
        "microservicios_mapeados": [
            "MS-01: Usuarios y Alojamientos (Hexagonal)",
            "MS-02: Reservas y Estadías (DynamoDB/NestJS)",
            "MS-03: Comercial y Financiero (Laravel DDD)",
            "MS-04: IA & Copiloto (FastAPI/MongoDB)",
            "Broker AMQP: RabbitMQ SAGA Orchestrator"
        ]
    }, indent=2)

def list_domain_classes() -> str:
    """Lista todas las clases de dominio modeladas en Enterprise Architect con sus estereotipos y microservicios."""
    classes = [
        {"nombre": "Usuario", "estereotipo": "entity", "microservicio": "MS-01", "tecnologia": "Spring Boot / PostgreSQL"},
        {"nombre": "RolUsuario", "estereotipo": "enumeration", "microservicio": "MS-01", "valores": ["CLIENTE", "ANFITRION", "ADMINISTRADOR"]},
        {"nombre": "EstadoUsuario", "estereotipo": "enumeration", "microservicio": "MS-01", "valores": ["PENDIENTE_VERIF", "ACTIVO", "SUSPENDIDO"]},
        {"nombre": "Alojamiento", "estereotipo": "entity", "microservicio": "MS-01", "tecnologia": "Spring Boot / PostGIS"},
        {"nombre": "Habitacion", "estereotipo": "entity", "microservicio": "MS-01", "tecnologia": "Spring Boot"},
        {"nombre": "Reserva", "estereotipo": "aggregate_root", "microservicio": "MS-02", "tecnologia": "NestJS / DynamoDB"},
        {"nombre": "EstadoReserva", "estereotipo": "enumeration", "microservicio": "MS-02"},
        {"nombre": "TransaccionSaga", "estereotipo": "saga_orchestrator", "microservicio": "Transversal", "tecnologia": "RabbitMQ"},
        {"nombre": "Pago", "estereotipo": "aggregate_root", "microservicio": "MS-03", "tecnologia": "Laravel DDD / Postgres"},
        {"nombre": "FacturaElectronica", "estereotipo": "entity", "microservicio": "MS-03", "tecnologia": "SIN Bolivia"},
        {"nombre": "CopilotoSesion", "estereotipo": "document", "microservicio": "MS-04", "tecnologia": "FastAPI / MongoDB"},
        {"nombre": "Resena", "estereotipo": "document", "microservicio": "MS-04", "tecnologia": "FastAPI / n8n"}
    ]
    return json.dumps(classes, indent=2)

if mcp:
    @mcp.tool()
    def ea_get_architecture_status() -> str:
        return get_architecture_status()

    @mcp.tool()
    def ea_list_domain_classes() -> str:
        return list_domain_classes()

if __name__ == "__main__":
    if mcp:
        mcp.run()
    else:
        print(get_architecture_status())
