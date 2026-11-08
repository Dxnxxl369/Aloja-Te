"""Servicio singleton para carga del modelo y ejecución de inferencias."""

import time
from functools import lru_cache
import joblib
import json

from src import db
from src.config import ARTIFACTS_DIR


class ModelService:
    """Administra la carga en memoria del pipeline entrenado y sus métricas."""

    def __init__(self):
        self.modelo_path = ARTIFACTS_DIR / "model.joblib"
        self.metricas_path = ARTIFACTS_DIR / "metrics.json"
        self.pipeline = None
        self.metadata = {}
        self.metricas = {}
        self.cargar_artefactos()

    def cargar_artefactos(self):
        """Carga el modelo serializado y las métricas una sola vez al iniciar la API."""
        if not self.modelo_path.exists():
            raise FileNotFoundError(f"No se encontró el modelo en {self.modelo_path}. Ejecuta 'python -m src.pipeline' primero.")

        artefacto = joblib.load(self.modelo_path)
        self.pipeline = artefacto["pipeline"]
        self.metadata = {
            "version": artefacto.get("version", "1.0.0"),
            "modelo": artefacto.get("model", "desconocido"),
            "etiqueta": artefacto.get("label", "Desconocido"),
            "config": artefacto.get("config", {}),
        }

        if self.metricas_path.exists():
            with open(self.metricas_path, "r", encoding="utf-8") as f:
                self.metricas = json.load(f)

    def predict(self, texto: str) -> dict:
        """Realiza la clasificación de una reseña y devuelve el desglose paso a paso."""
        t_inicio = time.perf_counter()

        # 1. Inferencia del pipeline completo
        prediccion = self.pipeline.predict([texto])[0]
        probabilidades = self.pipeline.predict_proba([texto])[0]
        clases = list(self.pipeline.classes_)

        distribucion = {
            clase: round(float(prob), 4)
            for clase, prob in zip(clases, probabilidades)
        }
        probabilidad_maxima = round(float(max(probabilidades)), 4)

        # 2. Desglose explicativo del preprocesamiento
        preprocesador = self.pipeline.named_steps["preprocessor"]
        explicacion = preprocesador.explain(texto)

        latencia_ms = round((time.perf_counter() - t_inicio) * 1000, 2)

        # 3. Registro en base de datos
        db.log_prediction(texto, prediccion, probabilidad_maxima, latencia_ms)

        return {
            "sentimiento": prediccion,
            "probabilidad": probabilidad_maxima,
            "distribucion_probabilidades": distribucion,
            "latencia_ms": latencia_ms,
            "modelo": self.metadata["etiqueta"],
            "desglose_nlp": {
                "original": explicacion["original"],
                "normalizado": explicacion["normalized"],
                "tokens": explicacion["tokens"],
                "stop_words_eliminadas": explicacion["removed_stopwords"],
                "tokens_sin_stop_words": explicacion["without_stopwords"],
                "raices": explicacion["roots"],
                "tokens_finales": explicacion["final"],
            }
        }

    def predict_batch(self, resenas: list[str]) -> dict:
        """Clasifica un lote de reseñas."""
        predicciones = self.pipeline.predict(resenas)
        probabilidades = self.pipeline.predict_proba(resenas)

        resultados = []
        conteo_sentimientos = {"negativo": 0, "neutro": 0, "positivo": 0}

        for texto, pred, prob in zip(resenas, predicciones, probabilidades):
            p_max = round(float(max(prob)), 4)
            conteo_sentimientos[pred] = conteo_sentimientos.get(pred, 0) + 1
            resultados.append({
                "texto": texto,
                "sentimiento": pred,
                "probabilidad": p_max,
            })

        return {
            "total": len(resenas),
            "resumen_sentimientos": conteo_sentimientos,
            "resultados": resultados,
        }

    def get_metrics(self) -> dict:
        """Devuelve el resumen de métricas del modelo."""
        return self.metricas


@lru_cache
def get_model_service() -> ModelService:
    """Instancia única (Singleton) del servicio del modelo."""
    return ModelService()
