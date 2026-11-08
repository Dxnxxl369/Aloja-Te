"""Comparación experimental y búsqueda de hiperparámetros con validación cruzada.

Evalúa sistemáticamente todas las combinaciones exigidas por la rúbrica:
- Stemming vs Lematización
- Stop words por defecto vs ajustadas (conservando negaciones)
- Unigramas vs Unigramas + Bigramas
- Naive Bayes Multinomial vs Regresión Logística vs Línea Base (Dummy)
"""

import itertools
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

from src.nlp.preprocessing import TextPreprocessor

NOMBRES_MODELOS = {
    "baseline": "Línea Base (Dummy)",
    "naive_bayes": "Naive Bayes Multinomial",
    "logistic_regression": "Regresión Logística",
}


def build_pipeline(configuracion: dict, params: dict) -> Pipeline:
    """Construye un Pipeline completo de scikit-learn listo para entrenar o predecir."""
    # 1. Preprocesamiento de texto
    preprocessor = TextPreprocessor(
        normalizer=configuracion.get("normalizer", "stem"),
        stopword_list=configuracion.get("stopword_list", "adjusted"),
        keep_words=params["nlp"]["keep_words"],
        extra_stopwords=params["nlp"]["extra_stopwords"],
    )

    # 2. Vectorizador TF-IDF
    rango_ngrama = tuple(configuracion.get("ngram_range", [1, 2]))
    vectorizer = TfidfVectorizer(
        ngram_range=rango_ngrama,
        max_features=params["tfidf"]["max_features"],
        min_df=params["tfidf"]["min_df"],
        max_df=params["tfidf"]["max_df"],
        sublinear_tf=params["tfidf"]["sublinear_tf"],
    )

    # 3. Estimador / Modelo
    modelo_nombre = configuracion.get("model", "logistic_regression")
    hiperparametros = configuracion.get("hyperparameters", {})

    if modelo_nombre == "baseline":
        estimador = DummyClassifier(strategy="most_frequent")
    elif modelo_nombre == "naive_bayes":
        estimador = MultinomialNB(**hiperparametros)
    elif modelo_nombre == "logistic_regression":
        estimador = LogisticRegression(
            max_iter=1000,
            random_state=params["seed"],
            **hiperparametros
        )
    else:
        raise ValueError(f"Modelo desconocido: {modelo_nombre}")

    return Pipeline([
        ("preprocessor", preprocessor),
        ("tfidf", vectorizer),
        ("model", estimador),
    ])


def run_experiments(X_train: pd.Series, y_train: pd.Series, params: dict) -> pd.DataFrame:
    """Ejecuta la validación cruzada estratificada para todas las combinaciones."""
    seed = params["seed"]
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=seed)
    resultados = []

    normalizadores = params["experiments"]["normalizers"]
    listas_stopwords = params["experiments"]["stopword_lists"]
    rangos_ngramas = [tuple(r) for r in params["experiments"]["ngram_ranges"]]

    # Pre-calcular preprocesamientos para optimizar el tiempo de búsqueda
    textos_preprocesados = {}
    for norm in normalizadores:
        for sw in listas_stopwords:
            clave = (norm, sw)
            pre = TextPreprocessor(
                normalizer=norm,
                stopword_list=sw,
                keep_words=params["nlp"]["keep_words"],
                extra_stopwords=params["nlp"]["extra_stopwords"],
            )
            textos_preprocesados[clave] = pre.fit_transform(X_train)

    # 1. Línea Base (Dummy)
    dummy = DummyClassifier(strategy="most_frequent")
    dummy.fit(X_train, y_train)
    # F1 macro del dummy con 5-fold
    from sklearn.model_selection import cross_val_score
    scores_dummy = cross_val_score(dummy, X_train, y_train, cv=cv, scoring="f1_macro")
    resultados.append({
        "model": "baseline",
        "normalizer": "-",
        "stopword_list": "-",
        "ngram_range": "-",
        "hyperparameters": {"strategy": "most_frequent"},
        "cv_f1_macro": round(float(scores_dummy.mean()), 4),
        "cv_f1_macro_std": round(float(scores_dummy.std()), 4),
    })

    # 2. Grid Search para Naive Bayes y Regresión Logística
    modelos_a_evaluar = {
        "naive_bayes": (
            MultinomialNB(),
            params["experiments"]["models"]["naive_bayes"]
        ),
        "logistic_regression": (
            LogisticRegression(max_iter=1000, random_state=seed),
            params["experiments"]["models"]["logistic_regression"]
        ),
    }

    combinaciones_nlp = list(itertools.product(normalizadores, listas_stopwords, rangos_ngramas))
    print(f"Evaluando {len(combinaciones_nlp)} configuraciones de NLP x 2 familias de modelos...")

    for norm, sw, ngram in combinaciones_nlp:
        X_proc = textos_preprocesados[(norm, sw)]
        tfidf = TfidfVectorizer(
            ngram_range=ngram,
            max_features=params["tfidf"]["max_features"],
            min_df=params["tfidf"]["min_df"],
            max_df=params["tfidf"]["max_df"],
            sublinear_tf=params["tfidf"]["sublinear_tf"],
        )
        X_vec = tfidf.fit_transform(X_proc)

        for nombre_modelo, (estimador_base, param_grid) in modelos_a_evaluar.items():
            grid = GridSearchCV(
                estimator=estimador_base,
                param_grid=param_grid,
                cv=cv,
                scoring="f1_macro",
                n_jobs=-1,
            )
            grid.fit(X_vec, y_train)

            resultados.append({
                "model": nombre_modelo,
                "normalizer": norm,
                "stopword_list": sw,
                "ngram_range": f"{ngram[0]}-{ngram[1]}",
                "hyperparameters": grid.best_params_,
                "cv_f1_macro": round(float(grid.best_score_), 4),
                "cv_f1_macro_std": round(float(grid.cv_results_["std_test_score"][grid.best_index_]), 4),
            })

    df_res = pd.DataFrame(resultados).sort_values(by="cv_f1_macro", ascending=False).reset_index(drop=True)
    return df_res
