"""Pipeline de Preprocesamiento de Texto en Español para Reseñas de Alojamientos.

Este módulo implementa todas las técnicas exigidas por la rúbrica:
1. Normalización: minúsculas, URLs, menciones, emojis, números, jerga y elongaciones.
2. Tokenización: separación limpia en tokens excluyendo caracteres no alfabéticos.
3. Stop words: lista base en español vs lista adaptada protegiendo negaciones ('no', 'nunca', 'jamas').
4. Stemming (Snowball) vs Lematización (spaCy): reducción morfológica.
5. Tratamiento de tildes: unificación al final para consistencia ortográfica.
"""

import re
import unicodedata
from functools import lru_cache

import emoji
from sklearn.base import BaseEstimator, TransformerMixin

# Expresiones regulares para limpieza de texto
URL_REGEX = re.compile(r"https?://\S+|www\.\S+")
MENTION_REGEX = re.compile(r"@\w+")
NUMBER_REGEX = re.compile(r"\d+([.,/:]\d+)*%?")
ELONGATION_REGEX = re.compile(r"(\w)\1{2,}")  # En español ninguna letra se repite 3 veces seguidas
NON_LETTER_REGEX = re.compile(r"[^a-záéíóúüñ_\s]")
MULTIPLE_SPACES_REGEX = re.compile(r"\s+")

# Diccionario de jerga común en mensajería y reseñas informales
JERGA_CHAT = {
    "q": "que",
    "k": "que",
    "x": "por",
    "pq": "porque",
    "xq": "porque",
    "tb": "también",
    "tmb": "también",
    "bn": "bien",
    "ps": "pues",
    "grax": "gracias",
    "d": "de",
    "recom": "recomiendo",
    "wifi": "internet",
    "wi-fi": "internet",
    "pele": "pesimo",
    "chafa": "malo",
}

# Conversión de emojis a palabras que aportan señal de sentimiento
EMOJIS_A_PALABRAS = {
    "emojipositivo": "😍👍😋🔥❤👌😀😃😄😊🥰🤩💯👏🙌😁🛌✨",
    "emojinegativo": "😡👎🤢😤💩😠😞😢🤮😭😫🥶🦟🦗💔",
    "emojiironia": "🙃🙄😒",
}
MAPA_EMOJIS = {caracter: palabra for palabra, caracteres in EMOJIS_A_PALABRAS.items() for caracter in caracteres}

LISTAS_STOPWORDS_VALIDAS = ("default", "adjusted")
NORMALIZADORES_VALIDOS = ("stem", "lemma")


def strip_accents(texto: str) -> str:
    """Elimina las tildes del texto pero conserva la letra 'ñ'.
    
    Ejemplo: 'habitación' -> 'habitacion', pero 'baño' sigue siendo 'baño'.
    """
    texto_str = str(texto or "")
    texto_seguro = texto_str.replace("ñ", "\0")
    texto_normalizado = "".join(
        caracter for caracter in unicodedata.normalize("NFD", texto_seguro)
        if unicodedata.category(caracter) != "Mn"
    )
    return texto_normalizado.replace("\0", "ñ")


def _reemplazar_emoji(caracteres: str, _data: dict) -> str:
    """Reemplaza emojis conocidos por su categoría de sentimiento."""
    caracter_limpio = caracteres.replace(chr(0xFE0F), "")
    palabra = MAPA_EMOJIS.get(caracter_limpio, "")
    return f" {palabra} " if palabra else " "


def normalize(texto: str) -> str:
    """Paso 1: Normalización de texto crudo.
    
    Conserva las tildes en este paso para que el lematizador de spaCy
    pueda reconocer correctamente las formas verbales y sustantivos.
    """
    if not texto:
        return ""
    texto = texto.lower()
    texto = URL_REGEX.sub(" ", texto)
    texto = MENTION_REGEX.sub(" ", texto)
    texto = texto.replace("#", " ")
    texto = emoji.replace_emoji(texto, replace=_reemplazar_emoji)
    texto = NUMBER_REGEX.sub(" ", texto)
    texto = ELONGATION_REGEX.sub(r"\1", texto)  # 'buenoooo' -> 'bueno'
    texto = NON_LETTER_REGEX.sub(" ", texto)

    # Reemplazo de abreviaturas y jerga
    palabras = [JERGA_CHAT.get(palabra, palabra) for palabra in texto.split()]
    return MULTIPLE_SPACES_REGEX.sub(" ", " ".join(palabras)).strip()


def tokenize(texto_normalizado: str) -> list[str]:
    """Paso 2: Tokenización.
    
    Al haber normalizado previamente, la división por espacios genera tokens limpios.
    Se descartan tokens de un solo caracter ('a', 'y', 'o', etc.).
    """
    if not texto_normalizado:
        return []
    return [token for token in texto_normalizado.split(" ") if len(token) > 1]


def obtener_stopwords(tipo_lista: str = "adjusted", palabras_a_conservar: tuple = (), palabras_extra: tuple = ()) -> frozenset:
    """Paso 3: Obtención de la lista de Stop Words en español."""
    return _obtener_stopwords_cache(tipo_lista, tuple(palabras_a_conservar or ()), tuple(palabras_extra or ()))


@lru_cache
def _obtener_stopwords_cache(tipo_lista: str = "adjusted", palabras_a_conservar: tuple = (), palabras_extra: tuple = ()) -> frozenset:
    """Paso 3: Obtención de la lista de Stop Words en español (con caché).
    
    - 'default': Lista estándar de NLTK en español.
    - 'adjusted': Lista modificada donde se conservan negaciones ('no', 'nunca', 'jamas')
      y palabras con carga emocional, y se añaden términos frecuentes del dominio hotelero.
    """
    import nltk
    from nltk.corpus import stopwords as nltk_stopwords

    if tipo_lista not in LISTAS_STOPWORDS_VALIDAS:
        raise ValueError(f"tipo_lista debe ser una de {LISTAS_STOPWORDS_VALIDAS}")

    lista_base = set(strip_accents(p) for p in nltk_stopwords.words("spanish"))

    if tipo_lista == "adjusted":
        # Conservar negaciones y términos con sentimiento
        palabras_protegidas = set(strip_accents(p) for p in palabras_a_conservar)
        lista_base -= palabras_protegidas

        # Agregar términos redundantes de hotelería
        terminos_extra = set(strip_accents(p) for p in palabras_extra)
        lista_base |= terminos_extra

    return frozenset(lista_base)


@lru_cache
def _obtener_stemmer():
    """Carga en caché el algoritmo Snowball Stemmer para español."""
    from nltk.stem import SnowballStemmer
    return SnowballStemmer("spanish")


@lru_cache
def _obtener_spacy():
    """Carga en caché el modelo ligero de spaCy en español (solo tokenizador y lemmatizer)."""
    import spacy
    return spacy.load("es_core_news_sm", disable=["parser", "ner"])


def _es_token_especial(token: str) -> bool:
    """Verifica si el token es un indicador especial (ej. emojipositivo)."""
    return token.startswith("emoji")


class TextPreprocessor(BaseEstimator, TransformerMixin):
    """Transformador compatible con scikit-learn para preprocesamiento de reseñas.
    
    Integra todo el pipeline de NLP en un solo objeto para que pueda serializarse
    junto al vectorizador TF-IDF y el modelo de clasificación.
    """

    def __init__(
        self,
        normalizer: str = "stem",
        stopword_list: str = "adjusted",
        keep_words: tuple = (),
        extra_stopwords: tuple = ()
    ):
        self.normalizer = normalizer
        self.stopword_list = stopword_list
        self.keep_words = tuple(keep_words) if keep_words else ()
        self.extra_stopwords = tuple(extra_stopwords) if extra_stopwords else ()

    def fit(self, X, y=None):
        if self.normalizer not in NORMALIZADORES_VALIDOS:
            raise ValueError(f"normalizer debe ser uno de {NORMALIZADORES_VALIDOS}")
        if self.stopword_list not in LISTAS_STOPWORDS_VALIDAS:
            raise ValueError(f"stopword_list debe ser uno de {LISTAS_STOPWORDS_VALIDAS}")
        return self

    def transform(self, X) -> list[str]:
        """Aplica el preprocesamiento completo y retorna una lista de textos limpios."""
        resultados = self._analizar_lote(list(X))
        return [" ".join(res["final"]) for res in resultados]

    def explain(self, texto: str) -> dict:
        """Devuelve todos los pasos intermedios de un texto para el frontend y la API."""
        return self._analizar_lote([texto])[0]

    def _get_stopwords(self) -> frozenset:
        return obtener_stopwords(self.stopword_list, self.keep_words, self.extra_stopwords)

    def _aplicar_raices(self, lista_tokens_por_texto: list[list[str]]) -> list[list[str]]:
        """Aplica reducción morfológica (Stemming o Lematización)."""
        if self.normalizer == "stem":
            stem_fn = _obtener_stemmer().stem
            return [
                [token if _es_token_especial(token) else stem_fn(token) for token in tokens]
                for tokens in lista_tokens_por_texto
            ]

        # Lematización con spaCy
        from spacy.tokens import Doc
        nlp = _obtener_spacy()
        docs = (Doc(nlp.vocab, words=tokens) for tokens in lista_tokens_por_texto)
        return [
            [token.text if _es_token_especial(token.text) else token.lemma_.lower() for token in doc]
            for doc in nlp.pipe(docs, batch_size=256)
        ]

    def _analizar_lote(self, textos: list[str]) -> list[dict]:
        """Ejecuta los pasos de normalización, tokenización, stop words y lemas/stems."""
        textos_normalizados = [normalize(t or "") for t in textos]
        tokens_por_texto = [tokenize(n) for n in textos_normalizados]
        raices_por_texto = self._aplicar_raices(tokens_por_texto)
        stop_words = self._get_stopwords()

        analisis_completo = []
        for texto_orig, norm, tokens, raices in zip(textos, textos_normalizados, tokens_por_texto, raices_por_texto):
            # Filtrado de stop words conservando alineación con las raíces
            tokens_conservados = [
                (t, r) for t, r in zip(tokens, raices)
                if strip_accents(t) not in stop_words
            ]
            tokens_eliminados = [
                t for t in tokens if strip_accents(t) in stop_words
            ]

            analisis_completo.append({
                "original": texto_orig,
                "normalized": norm,
                "tokens": tokens,
                "removed_stopwords": tokens_eliminados,
                "without_stopwords": [t for t, _ in tokens_conservados],
                "roots": [r for _, r in tokens_conservados],
                "final": [strip_accents(r) for _, r in tokens_conservados],
            })

        return analisis_completo
