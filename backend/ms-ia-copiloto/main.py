import os
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ms-ia-copiloto")

app = FastAPI(
    title="MS-04 Inteligencia Artificial & Copiloto (Aloja-Te)",
    description="Servicio de IA: Reportes Generativos con IA, Copiloto LLM, MCP y Análisis NLP",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "")

SYSTEM_PROMPT_ANALISTA_SQL = """Eres un Analista de Datos Senior y Especialista en SQL para SQLite y AlaSQL en memoria de la plataforma hotelera Aloja-Te (Bolivia).
Tu ÚNICA tarea es generar la consulta SQL SELECT óptima para responder a la solicitud del usuario, basándote en el esquema de tablas provisto.

Esquema de la Base de Datos:
{schema_text}

PROTOCOLO DE RESPUESTA ESTRICTO:

1. AUTO-EXPLORACIÓN (CONSULTAR):
   Si la solicitud del usuario menciona una categoría, estado, valor textual o término ambiguo (por ejemplo: "reservas pendientes", "tipo suite", "habitaciones libres", "opiniones de limpieza", "Santa Cruz", "confirmadas") y NO conoces los valores exactos almacenados en esa columna:
   RESPONDE ÚNICAMENTE CON:
   CONSULTAR: SELECT DISTINCT <columna> FROM <tabla> LIMIT 15;

   (El software ejecutará tu consulta de inmediato sobre los datos locales y te devolverá los valores reales para que puedas armar la consulta final con exactitud).

2. CONSULTA FINAL (QUERY):
   Si ya conoces los valores exactos, o ya recibiste los resultados de tu CONSULTAR previo, o la consulta no requiere explorar datos:
   RESPONDE ÚNICAMENTE CON:
   QUERY: SELECT <columnas> FROM <tabla> WHERE ...;

3. REGLAS DE ORO:
   - INTEGRIDAD DE FILTRO: Si el usuario dice "solo nombre y tarifa", proyecta únicamente esos campos en el SELECT, pero NUNCA olvides incluir la condición de filtrado en el WHERE.
   - Si el usuario no pide columnas específicas, proyecta las columnas clave útiles para negocio.
   - En importes monetarios usa la moneda en Bolivianos (BOB / Bs.).
   - NUNCA uses bloques de código markdown (sin comillas invertidas ni bloques ```sql).
   - NUNCA incluyas explicaciones, saludos ni texto adicional.
   - Tu respuesta DEBE comenzar obligatoriamente con el prefijo "CONSULTAR:" o "QUERY:".
"""

class ReportQueryRequest(BaseModel):
    query: str
    schema_text: Optional[str] = "Sin esquema explícito"
    observations: Optional[List[Dict[str, Any]]] = None
    role: Optional[str] = "ANFITRION"

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ms-ia-copiloto",
        "groq_configured": bool(GROQ_API_KEY),
        "gemini_configured": bool(GOOGLE_API_KEY),
        "protocols": ["REST", "MCP", "AlaSQL"]
    }

async def call_groq_llm(user_message: str, system_prompt: str) -> str:
    """Llamada ultra veloz a Groq (openai/gpt-oss-120b o qwen/qwen3.8-27b) con latencia < 350ms."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY no configurada")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    # Intentamos primero con openai/gpt-oss-120b y luego con qwen/qwen3.8-27b
    for model_name in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.1,
            "max_tokens": 512
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    if content and content.strip():
                        return content.strip()
        except Exception as err:
            logger.warning(f"Intento con modelo {model_name} falló: {err}")
            continue

    raise RuntimeError("No se obtuvo respuesta válida de Groq")

async def call_gemini_llm(user_message: str, system_prompt: str) -> str:
    """Llamada a Google Gemini (gemini-flash-latest o gemini-pro-latest)."""
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY no configurada")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GOOGLE_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_prompt}\n\nSolicitud del Usuario:\n{user_message}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 512
        }
    }

    async with httpx.AsyncClient(timeout=12.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()

def fallback_local_sql(query: str, role: str) -> str:
    """Generador semántico local determinístico si no hay conexión externa."""
    q = query.lower()
    if "ocupaci" in q or "habitaci" in q:
        return "QUERY: SELECT nombre, tipoPropiedad, precioBaseNoche, estadoOperativo FROM unidades ORDER BY precioBaseNoche DESC;"
    if "reserva" in q or "pin" in q:
        return "QUERY: SELECT idReserva, huespedNombre, desde, hasta, estado, pinSecreto, montoTotal FROM reservas ORDER BY desde DESC;"
    if "ingreso" in q or "finanza" in q or "comision" in q:
        return "QUERY: SELECT periodo, ingresosBrutos, comisionPlataforma, netoLiquidado, estado FROM liquidaciones ORDER BY periodo DESC;"
    if "reseña" in q or "calificaci" in q or "topico" in q:
        return "QUERY: SELECT autor, puntuacion, topico, sentimiento, comentario FROM valoraciones ORDER BY puntuacion DESC;"
    return "QUERY: SELECT * FROM alojamientos LIMIT 10;"

@app.post("/api/v1/ia/reporte-query")
async def generar_reporte_query(req: ReportQueryRequest):
    """
    Endpoint del Analista SQL Agéntico Multi-Turno.
    Procesa solicitudes de reportes en lenguaje natural y genera sentencias CONSULTAR o QUERY.
    """
    system_prompt = SYSTEM_PROMPT_ANALISTA_SQL.format(schema_text=req.schema_text or "Sin esquema")
    
    # Construir el mensaje de entrada con observaciones previas si existen
    user_content = f"Consulta solicitada: \"{req.query}\"\nRol activo: {req.role}"
    if req.observations and len(req.observations) > 0:
        obs_text = json.dumps(req.observations, ensure_ascii=False)
        user_content += f"\n\nValores reales obtenidos de la base de datos (observaciones previas):\n{obs_text}\n\nCon esta información exacta, genera la consulta SQL definitiva respondiendo con: QUERY: <sql_final>."

    llm_output = ""
    provider_used = "Groq High-Speed LLM"

    # Intento 1: Groq (ultra veloz)
    try:
        llm_output = await call_groq_llm(user_content, system_prompt)
    except Exception as e_groq:
        logger.warning(f"Fallo en Groq: {e_groq}. Reintentando con Google Gemini...")
        # Intento 2: Gemini
        try:
            llm_output = await call_gemini_llm(user_content, system_prompt)
            provider_used = "Google Gemini Flash"
        except Exception as e_gem:
            logger.error(f"Fallo en Gemini: {e_gem}. Aplicando analizador semántico local.")
            llm_output = fallback_local_sql(req.query, req.role or "ANFITRION")
            provider_used = "Motor Semántico Local (Resiliente)"

    # Limpieza de bloques de markdown si el LLM los incluyó
    cleaned = llm_output.replace("```sql", "").replace("```", "").strip()

    # Detección de acción: CONSULTAR vs QUERY
    action = "QUERY"
    sql = cleaned
    if cleaned.startswith("CONSULTAR:"):
        action = "CONSULTAR"
        sql = cleaned[len("CONSULTAR:"):].strip()
    elif cleaned.startswith("QUERY:"):
        action = "QUERY"
        sql = cleaned[len("QUERY:"):].strip()

    return {
        "status": "success",
        "action": action,
        "sql": sql,
        "raw_response": cleaned,
        "provider": provider_used,
        "query_original": req.query
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3004))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
