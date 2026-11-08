"""Script reproducible de entrenamiento y serialización de modelos."""

from datetime import datetime, timezone
import json
from pathlib import Path
import joblib
import pandas as pd

from src.config import ARTIFACTS_DIR, LABELS, ROOT, load_params
from src.data.prepare import clean, describe, split
from src.models.evaluate import (
    accuracy_by_phenomenon,
    classification_metrics,
    error_examples,
    error_table,
    top_terms,
)
from src.models.experiments import (
    NOMBRES_MODELOS,
    build_pipeline,
    run_experiments,
)


def factor_effects(experiments_df: pd.DataFrame) -> dict:
    """Calcula el mejor F1 macro alcanzado por cada decisión técnica."""
    sin_baseline = experiments_df[experiments_df["model"] != "baseline"]
    efectos = {}
    for factor in ["normalizer", "stopword_list", "ngram_range", "model"]:
        efectos[factor] = sin_baseline.groupby(factor)["cv_f1_macro"].max().round(4).to_dict()
    return efectos


def train(raw_df: pd.DataFrame, params: dict, artifacts_dir: Path = ARTIFACTS_DIR) -> dict:
    """Ejecuta el flujo completo de entrenamiento, evaluación y serialización."""
    seed = params["seed"]
    print("\n[1/5] Limpiando datos y eliminando duplicados...")
    df_limpio, stats_limpieza = clean(raw_df)
    eda = describe(df_limpio, params["nlp"]["keep_words"], params["nlp"]["extra_stopwords"])

    print(f"[2/5] Partición estratificada (80% train / 20% test)...")
    train_df, test_df = split(df_limpio, test_size=params["data"]["test_size"], seed=seed)
    print(f"      Entrenamiento: {len(train_df)} muestras | Prueba: {len(test_df)} muestras")

    print("[3/5] Ejecutando validación cruzada (GridSearch 5-Folds)...")
    experimentos = run_experiments(train_df["texto"], train_df["sentimiento"], params)

    print("[4/5] Evaluando los mejores modelos en el conjunto de prueba...")
    modelos_finales = []
    pipelines_entrenados = {}

    for nombre_modelo in ["logistic_regression", "naive_bayes", "baseline"]:
        fila_mejor = experimentos[experimentos["model"] == nombre_modelo].iloc[0]
        if nombre_modelo == "baseline":
            cfg = {"model": "baseline", "hyperparameters": {"strategy": "most_frequent"}}
        else:
            ngram_split = [int(x) for x in str(fila_mejor["ngram_range"]).split("-")]
            cfg = {
                "model": nombre_modelo,
                "normalizer": fila_mejor["normalizer"],
                "stopword_list": fila_mejor["stopword_list"],
                "ngram_range": ngram_split,
                "hyperparameters": fila_mejor["hyperparameters"] if isinstance(fila_mejor["hyperparameters"], dict) else json.loads(fila_mejor["hyperparameters"]),
            }

        pipe = build_pipeline(cfg, params)
        pipe.fit(train_df["texto"], train_df["sentimiento"])
        pipelines_entrenados[nombre_modelo] = pipe

        pred_test = pipe.predict(test_df["texto"])
        metricas_test = classification_metrics(test_df["sentimiento"], pred_test)

        modelos_finales.append({
            "name": nombre_modelo,
            "label": NOMBRES_MODELOS[nombre_modelo],
            "config": cfg,
            "cv_f1_macro": float(fila_mejor["cv_f1_macro"]),
            "cv_f1_macro_std": float(fila_mejor["cv_f1_macro_std"]),
            "test": metricas_test,
        })

    # Elegir el modelo en producción (mayor CV F1 macro que no sea baseline)
    candidatos_produccion = [m for m in modelos_finales if m["name"] != "baseline"]
    candidatos_produccion.sort(key=lambda x: x["cv_f1_macro"], reverse=True)
    modelo_ganador = candidatos_produccion[0]
    pipeline_ganador = pipelines_entrenados[modelo_ganador["name"]]

    print(f"      Modelo ganador seleccionado para producción: {modelo_ganador['label']} (CV F1: {modelo_ganador['cv_f1_macro']})")

    # Análisis de errores del modelo en producción
    tabla_errores = error_table(pipeline_ganador, test_df)
    analisis_fenomenos = accuracy_by_phenomenon(tabla_errores)
    ejemplos_fallos = error_examples(tabla_errores, n_muestras=5)
    terminos_clave = top_terms(pipeline_ganador, n_top=8)

    version = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    metricas_completas = {
        "version": version,
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "seed": seed,
        "labels": LABELS,
        "dataset": {
            "cleaning": stats_limpieza,
            "eda": eda,
            "train_size": len(train_df),
            "test_size": len(test_df),
            "train_counts": train_df["sentimiento"].value_counts().to_dict(),
            "test_counts": test_df["sentimiento"].value_counts().to_dict(),
        },
        "production": {
            "name": modelo_ganador["name"],
            "label": modelo_ganador["label"],
            "config": modelo_ganador["config"],
            "cv_f1_macro": modelo_ganador["cv_f1_macro"],
            "test_f1_macro": modelo_ganador["test"]["f1_macro"],
            "test_accuracy": modelo_ganador["test"]["accuracy"],
        },
        "models": modelos_finales,
        "experiments": experimentos.to_dict(orient="records"),
        "factor_effects": factor_effects(experimentos),
        "tfidf": params["tfidf"],
        "vocabulary_size": len(pipeline_ganador.named_steps["tfidf"].vocabulary_),
        "accuracy_by_phenomenon": analisis_fenomenos,
        "error_examples": ejemplos_fallos,
        "top_terms": terminos_clave,
    }

    print("[5/5] Guardando artefactos en artifacts/...")
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    # 1. Pipeline serializado
    joblib.dump({
        "pipeline": pipeline_ganador,
        "version": version,
        "model": modelo_ganador["name"],
        "label": modelo_ganador["label"],
        "config": modelo_ganador["config"]
    }, artifacts_dir / "model.joblib")

    # 2. Métricas JSON
    with open(artifacts_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metricas_completas, f, ensure_ascii=False, indent=2)

    # 3. CSV de experimentos
    df_exp_export = experimentos.copy()
    df_exp_export["hyperparameters"] = df_exp_export["hyperparameters"].apply(
        lambda x: json.dumps(x) if isinstance(x, dict) else str(x)
    )
    df_exp_export.to_csv(artifacts_dir / "experiments.csv", index=False)

    # 4. CSV de errores
    tabla_errores[~tabla_errores["correcto"]].to_csv(artifacts_dir / "errors.csv", index=False)

    print("\n" + "=" * 60)
    print("RESUMEN DE RESULTADOS")
    print("=" * 60)
    for m in modelos_finales:
        test_acc = m["test"]["accuracy"] * 100
        print(f"- {m['label']:25}: CV F1={m['cv_f1_macro']:.4f} | Test Acc={test_acc:.1f}% | Test F1={m['test']['f1_macro']:.4f}")
    print(f"\n¡Artefactos guardados con éxito en: {artifacts_dir}!")
    return metricas_completas


def main():
    params = load_params()
    ruta_csv = ROOT / params["data"]["raw_path"]
    if not ruta_csv.exists():
        print(f"Generando datos iniciales en {ruta_csv}...")
        from src.data.generate import generar_dataset
        df = generar_dataset(params["data"]["n_reviews"], params["seed"])
        ruta_csv.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(ruta_csv, index=False)
    else:
        df = pd.read_csv(ruta_csv)

    train(df, params)


if __name__ == "__main__":
    main()
