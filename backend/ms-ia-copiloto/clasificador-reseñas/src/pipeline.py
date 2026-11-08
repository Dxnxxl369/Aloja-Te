"""Pipeline maestro reproducible de un solo comando.

Ejecución:
    python -m src.pipeline
    python -m src.pipeline --force-regenerate-data

Pasos que realiza de punta a punta:
1. Genera o lee el dataset de reseñas turísticas crudas en español (data/raw/).
2. Sincroniza las reseñas en la base de datos (PostgreSQL o SQLite local).
3. Aplica limpieza y división estratificada (train 80% / test 20%).
4. Ejecuta validación cruzada para 16 experimentos comparando técnicas de NLP y modelos.
5. Selecciona el mejor modelo y lo serializa en artifacts/model.joblib junto con metrics.json.
"""

import argparse
import pandas as pd

from src import db
from src.config import ARTIFACTS_DIR, ROOT, load_params
from src.data.generate import generar_dataset
from src.models import train


def run_pipeline(force_regenerate: bool = False):
    params = load_params()
    csv_path = ROOT / params["data"]["raw_path"]

    print("=" * 65)
    print("INICIANDO PIPELINE REPRODUCIBLE DE NLP Y MACHINE LEARNING")
    print("=" * 65)

    # 1. Datos crudos
    if force_regenerate or not csv_path.exists():
        print(f"[Paso 1/3] Generando dataset de reseñas de alojamiento en {csv_path}...")
        df_raw = generar_dataset(params["data"]["n_reviews"], params["seed"])
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        df_raw.to_csv(csv_path, index=False, encoding="utf-8")
    else:
        print(f"[Paso 1/3] Leyendo dataset crudo existente: {csv_path}")
        df_raw = pd.read_csv(csv_path)

    # 2. Base de datos
    print(f"[Paso 2/3] Almacenando {len(df_raw)} registros en la base de datos...")
    try:
        db.save_reviews(df_raw)
        print("      Sincronización en base de datos completada.")
    except Exception as e:
        print(f"      Aviso: Almacenamiento directo en CSV utilizado ({e}).")

    # 3. Entrenamiento y Serialización
    print("[Paso 3/3] Entrenando experimentos y serializando artefactos...")
    metricas = train.train(df_raw, params, ARTIFACTS_DIR)

    print("\n¡Pipeline ejecutado con éxito! El modelo en producción está listo para usarse.")
    return metricas


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline reproducible de NLP y Modelos.")
    parser.add_argument("--force-regenerate-data", action="store_true", help="Forzar regeneración del CSV.")
    args = parser.parse_args()
    run_pipeline(args.force_regenerate_data)
