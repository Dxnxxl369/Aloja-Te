"""API REST con FastAPI para el Clasificador de Reseñas de Alojamientos Turísticos."""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from api.schemas import (
    BatchPredictRequest,
    BatchPredictResponse,
    HealthResponse,
    PredictRequest,
    PredictResponse,
)
from api.service import get_model_service
from src.config import LABELS, ROOT


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa y calienta el modelo en memoria antes de recibir peticiones."""
    try:
        service = get_model_service()
        print(f"API lista. Modelo cargado: {service.metadata.get('etiqueta', 'Desconocido')}")
    except Exception as e:
        print(f"Advertencia al iniciar API: {e}")
    yield


app = FastAPI(
    title="API de Clasificación de Reseñas de Alojamientos (Aloja-Te Bolivia)",
    description=(
        "Microservicio de Procesamiento de Lenguaje Natural (NLP) y Machine Learning "
        "para clasificar el sentimiento de opiniones turísticas (positivo, neutro, negativo) "
        "y exponer el desglose paso a paso de cada técnica aplicada."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Soporte de CORS para que cualquier microfrontend pueda consumir la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["Monitoreo"])
def health_check():
    """Verifica el estado del servicio y el modelo actualmente en producción."""
    service = get_model_service()
    return HealthResponse(
        estado="ok",
        servicio="Aloja-Te Sentiment Review Classifier",
        version_modelo=service.metadata.get("version", "1.0.0"),
        modelo_en_produccion=service.metadata.get("etiqueta", "Regresión Logística"),
        etiquetas=LABELS,
    )


@app.post("/api/predict", response_model=PredictResponse, tags=["Clasificación"])
def predict(request: PredictRequest):
    """Clasifica una reseña individual y devuelve la clase, probabilidades y desglose NLP."""
    try:
        service = get_model_service()
        resultado = service.predict(request.texto)
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante el procesamiento de la predicción: {str(e)}"
        )


@app.post("/api/batch", response_model=BatchPredictResponse, tags=["Clasificación"])
def predict_batch(request: BatchPredictRequest):
    """Clasifica un conjunto de reseñas en lote (útil para auditoría masiva de comentarios)."""
    try:
        service = get_model_service()
        return service.predict_batch(request.resenas)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en la predicción por lote: {str(e)}"
        )


@app.get("/api/metrics", tags=["Métricas"])
def get_metrics():
    """Retorna las métricas comparativas de entrenamiento, validación cruzada y prueba."""
    service = get_model_service()
    metricas = service.get_metrics()
    if not metricas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Métricas no encontradas. Ejecuta el pipeline de entrenamiento primero."
        )
    return metricas


# Servir la interfaz web interactiva (Frontend)
FRONTEND_DIR = ROOT / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/", include_in_schema=False)
    def index():
        return FileResponse(str(FRONTEND_DIR / "index.html"))
