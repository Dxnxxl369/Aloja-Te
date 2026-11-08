"""Cálculo de métricas, análisis de errores y términos influyentes."""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from src.config import LABELS


def classification_metrics(y_true, y_pred) -> dict:
    """Calcula las métricas exigidas: Accuracy, Precision, Recall y F1 macro/por clase."""
    matriz = confusion_matrix(y_true, y_pred, labels=LABELS)
    f1_por_clase = f1_score(y_true, y_pred, labels=LABELS, average=None, zero_division=0)

    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "f1_macro": round(float(f1_score(y_true, y_pred, average="macro", zero_division=0)), 4),
        "precision_macro": round(float(precision_score(y_true, y_pred, average="macro", zero_division=0)), 4),
        "recall_macro": round(float(recall_score(y_true, y_pred, average="macro", zero_division=0)), 4),
        "f1_por_clase": {clase: round(float(f1), 4) for clase, f1 in zip(LABELS, f1_por_clase)},
        "matriz_confusion": {
            "etiquetas": LABELS,
            "valores": matriz.tolist(),
        },
    }


def error_table(pipeline, test_df: pd.DataFrame) -> pd.DataFrame:
    """Genera una tabla comparando las etiquetas reales contra las predichas."""
    y_true = test_df["sentimiento"].values
    y_pred = pipeline.predict(test_df["texto"])
    probabilidades = pipeline.predict_proba(test_df["texto"])

    tabla = test_df.copy()
    tabla["real"] = y_true
    tabla["predicho"] = y_pred
    tabla["correcto"] = tabla["real"] == tabla["predicho"]
    tabla["probabilidad_maxima"] = probabilidades.max(axis=1).round(3)
    return tabla


def accuracy_by_phenomenon(tabla_errores: pd.DataFrame) -> dict:
    """Calcula la exactitud desglosada por fenómeno lingüístico."""
    if "fenomeno" not in tabla_errores.columns:
        return {}

    agrupado = tabla_errores.groupby("fenomeno")["correcto"].agg(["count", "mean"]).round(3)
    return {
        str(fenomeno): {
            "total_muestras": int(fila["count"]),
            "exactitud": float(fila["mean"]),
        }
        for fenomeno, fila in agrupado.iterrows()
    }


def error_examples(tabla_errores: pd.DataFrame, n_muestras: int = 5) -> list[dict]:
    """Extrae ejemplos representativos donde el modelo falló para el análisis cualitativo."""
    errores = tabla_errores[~tabla_errores["correcto"]]
    muestras = errores.head(n_muestras)

    ejemplos = []
    for _, fila in muestras.iterrows():
        ejemplos.append({
            "texto": fila["texto"],
            "etiqueta_real": fila["real"],
            "predicho": fila["predicho"],
            "fenomeno": fila.get("fenomeno", "desconocido"),
            "confianza": float(fila["probabilidad_maxima"]),
        })
    return ejemplos


def top_terms(pipeline, n_top: int = 8) -> dict:
    """Extrae las palabras con mayor peso por clase (interpretación de coeficientes)."""
    modelo = pipeline.named_steps.get("model")
    vectorizador = pipeline.named_steps.get("tfidf")

    if modelo is None or vectorizador is None or not hasattr(modelo, "coef_"):
        return {}

    nombres_features = np.array(vectorizador.get_feature_names_out())
    terminos_relevantes = {}

    for idx, clase in enumerate(pipeline.classes_):
        coeficientes = modelo.coef_[idx]
        top_indices = np.argsort(coeficientes)[-n_top:][::-1]
        terminos_relevantes[clase] = [
            {"termino": nombres_features[i], "peso": round(float(coeficientes[i]), 3)}
            for i in top_indices
        ]

    return terminos_relevantes
