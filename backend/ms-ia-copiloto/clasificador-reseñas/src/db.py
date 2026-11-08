"""Capa de persistencia de datos (soporta SQLite local y PostgreSQL).

Si la variable de entorno DATABASE_URL existe, se conecta a PostgreSQL.
Si no existe o falla, utiliza automáticamente una base de datos SQLite local
en data/alojate_reviews.db sin detener la ejecución.
"""

import json
import os
from functools import lru_cache
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from src.config import DATA_DIR

COLUMNAS_RESENAS = ["id", "alojamiento", "ciudad", "fecha", "texto", "estrellas", "sentimiento", "fenomeno"]


@lru_cache
def get_engine() -> Engine:
    """Crea y devuelve la conexión a la base de datos."""
    url = os.getenv("DATABASE_URL")
    if not url:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        url = f"sqlite:///{DATA_DIR / 'alojate_reviews.db'}"
    return create_engine(url, pool_pre_ping=True)


def init_db(engine: Engine = None):
    """Inicializa las tablas si no existen."""
    if engine is None:
        engine = get_engine()
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS resenas (
                id INTEGER PRIMARY KEY,
                alojamiento TEXT,
                ciudad TEXT,
                fecha TEXT,
                texto TEXT,
                estrellas INTEGER,
                sentimiento TEXT,
                fenomeno TEXT
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS predicciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha TEXT,
                texto TEXT,
                sentimiento TEXT,
                probabilidad REAL,
                latencia_ms REAL
            );
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS entrenamientos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version TEXT,
                modelo TEXT,
                cv_f1_macro REAL,
                test_f1_macro REAL,
                test_accuracy REAL,
                fecha_registro TEXT
            );
        """))


def save_reviews(df: pd.DataFrame, engine: Engine = None) -> None:
    """Guarda o actualiza el conjunto de reseñas en la base de datos."""
    if engine is None:
        engine = get_engine()
    init_db(engine)
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM resenas"))
        df[COLUMNAS_RESENAS].to_sql("resenas", conn, if_exists="append", index=False)


def get_reviews(engine: Engine = None) -> pd.DataFrame:
    """Lee las reseñas almacenadas en la base de datos."""
    if engine is None:
        engine = get_engine()
    init_db(engine)
    with engine.connect() as conn:
        return pd.read_sql(text("SELECT * FROM resenas ORDER BY id"), conn)


def log_prediction(texto: str, sentimiento: str, probabilidad: float, latencia_ms: float, engine: Engine = None) -> None:
    """Registra una predicción realizada por la API en la base de datos."""
    try:
        if engine is None:
            engine = get_engine()
        from datetime import datetime, timezone
        ahora = datetime.now(timezone.utc).isoformat(timespec="seconds")
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO predicciones (fecha, texto, sentimiento, probabilidad, latencia_ms)
                    VALUES (:fecha, :texto, :sentimiento, :probabilidad, :latencia_ms)
                """),
                {
                    "fecha": ahora,
                    "texto": texto[:500],
                    "sentimiento": sentimiento,
                    "probabilidad": probabilidad,
                    "latencia_ms": latencia_ms,
                }
            )
    except Exception:
        pass  # Si la base de datos no está disponible, la predicción responde igual
