"""Configuración y rutas del proyecto de NLP para Reseñas de Alojamientos."""

from pathlib import Path
import yaml

# Raíz de la carpeta del proyecto (topicos/)
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
ARTIFACTS_DIR = ROOT / "artifacts"
PARAMS_FILE = ROOT / "params.yaml"

# Clases oficiales del clasificador de sentimiento
LABELS = ["negativo", "neutro", "positivo"]


def load_params() -> dict:
    """Lee y devuelve los parámetros de configuración definidos en params.yaml."""
    with open(PARAMS_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)
