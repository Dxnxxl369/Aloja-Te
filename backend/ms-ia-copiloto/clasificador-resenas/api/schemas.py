"""Contratos de datos y esquemas de validación con Pydantic para la API REST."""

from pydantic import BaseModel, Field, field_validator


class PredictRequest(BaseModel):
    """Solicitud de predicción para una reseña individual."""
    texto: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="Texto de la reseña a clasificar.",
        examples=["La habitación estaba súper limpia y el anfitrión fue muy amable, 10/10!"]
    )

    @field_validator("texto")
    @classmethod
    def validar_contenido_no_vacio(cls, valor: str) -> str:
        limpio = valor.strip()
        if len(limpio) < 3:
            raise ValueError("El texto de la reseña debe contener al menos 3 caracteres significativos.")
        return limpio


class DesgloseNLP(BaseModel):
    """Visualización paso a paso de las transformaciones del pipeline de NLP."""
    original: str
    normalizado: str
    tokens: list[str]
    stop_words_eliminadas: list[str]
    tokens_sin_stop_words: list[str]
    raices: list[str]
    tokens_finales: list[str]


class PredictResponse(BaseModel):
    """Resultado de la predicción y trazabilidad técnica."""
    sentimiento: str
    probabilidad: float
    distribucion_probabilidades: dict[str, float]
    latencia_ms: float
    modelo: str
    desglose_nlp: DesgloseNLP


class BatchPredictRequest(BaseModel):
    """Solicitud para analizar múltiples reseñas a la vez."""
    resenas: list[str] = Field(..., min_length=1, max_length=1000)


class BatchItemResult(BaseModel):
    texto: str
    sentimiento: str
    probabilidad: float


class BatchPredictResponse(BaseModel):
    total: int
    resumen_sentimientos: dict[str, int]
    resultados: list[BatchItemResult]


class HealthResponse(BaseModel):
    estado: str
    servicio: str
    version_modelo: str
    modelo_en_produccion: str
    etiquetas: list[str]
