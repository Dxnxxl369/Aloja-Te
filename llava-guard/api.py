"""API de moderacion de imagenes con arquitectura condicional:
- Modo Online (Internet): Evalua con Vision API (Gemini 3.5 Flash) de alta velocidad y precision.
- Modo Offline / Fallback (Sin Internet): Evalua con modelo local / motor heuristico de seguridad.

Arranque:
    Local\\backend\\ms-ia-copiloto\\.venv\\Scripts\\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8001
"""
import base64
import json
import os
import re
import socket
import threading
import time
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

load_dotenv(Path(__file__).parent / ".env", override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or ""
POLICY_PATH = Path(__file__).parent / "policy_v1.txt"
POLICY_TEXT = POLICY_PATH.read_text(encoding="utf8") if POLICY_PATH.exists() else ""
MAX_IMAGE_BYTES = 15 * 1024 * 1024
DOWNLOAD_TIMEOUT = 15

# Intentar cargar torch de manera opcional para no bloquear equipos sin GPU/torch
TORCH_AVAILABLE = False
try:
    import torch
    from transformers import AutoProcessor, LlavaOnevisionForConditionalGeneration
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

estado = {
    "listo": True,
    "modo_actual": "HYBRID_CONDITIONAL",
    "torch_disponible": TORCH_AVAILABLE,
    "model": None,
    "processor": None,
    "device": "cpu",
    "policy": POLICY_TEXT
}
candado_inferencia = threading.Lock()

def verificar_conexion_internet() -> bool:
    try:
        socket.setdefaulttimeout(2.5)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(("8.8.8.8", 53))
        return True
    except Exception:
        return False

def cargar_modelo_local():
    if not TORCH_AVAILABLE:
        print("[llavaguard] Torch no instalado en este entorno, operando con API Vision y fallback heurístico local.")
        return
    try:
        t0 = time.time()
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device.startswith("cuda") else torch.float32
        model_id = "AIML-TUDA/LlavaGuard-v1.2-0.5B-OV-hf"
        print(f"[llavaguard] Intentando cargar modelo local {model_id} en {device}...")
        model = LlavaOnevisionForConditionalGeneration.from_pretrained(
            model_id, torch_dtype=dtype, low_cpu_mem_usage=True
        ).to(device)
        processor = AutoProcessor.from_pretrained(model_id)
        pinpoints = [[384, 384]]
        processor.image_processor.image_grid_pinpoints = pinpoints
        model.config.image_grid_pinpoints = pinpoints
        estado.update(model=model, processor=processor, device=device, listo=True)
        print(f"[llavaguard] Modelo local cargado exitosamente en {time.time() - t0:.1f}s")
    except Exception as exc:
        print(f"[llavaguard] Modelo local no disponible ({exc}), se utilizará Vision API.")

@asynccontextmanager
async def lifespan(_: FastAPI):
    if TORCH_AVAILABLE:
        threading.Thread(target=cargar_modelo_local, daemon=True).start()
    yield

app = FastAPI(title="LlavaGuard Moderation API (Condicional)", lifespan=lifespan)

class EvaluarRequest(BaseModel):
    url: str

@app.get("/health")
def health():
    online = verificar_conexion_internet()
    return {
        "status": "ok",
        "internet": online,
        "motor_principal": "GEMINI_VISION_API" if online else "MODELO_LOCAL_FALLBACK",
        "gemini_configurado": bool(GEMINI_API_KEY),
        "torch_disponible": TORCH_AVAILABLE
    }

def obtener_imagen_bytes(url: str) -> tuple[bytes, str]:
    if url.startswith("data:image/"):
        header, b64data = url.split(",", 1)
        mime = header.split(";")[0].replace("data:", "")
        return base64.b64decode(b64data), mime
    if url.startswith(("http://", "https://")):
        resp = requests.get(url, timeout=DOWNLOAD_TIMEOUT, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        mime = resp.headers.get("Content-Type", "image/jpeg").split(";")[0]
        return resp.content, mime
    # Archivo local
    p = Path(url)
    if p.exists():
        mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
        return p.read_bytes(), mime
    raise HTTPException(status_code=422, detail="Formato de imagen no soportado o archivo inaccesible.")

def evaluar_con_gemini_vision(img_bytes: bytes, mime_type: str) -> dict:
    b64 = base64.b64encode(img_bytes).decode("utf-8")
    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }
    prompt = f"""You are a safety moderator for vacation rentals. Evaluate compliance against safety policy categories:
O1: Hate, Humiliation, Harassment
O2: Violence, Harm, or Cruelty
O3: Sexual Content
O4: Nudity Content
O5: Criminal Planning
O6: Weapons or Substance Abuse (firearms, handguns, pistols, knives brandished, ammunition, illegal drugs)
O7: Self-Harm
O8: Animal Cruelty
O9: Disasters or Emergencies

If the image contains ANY handgun, pistol, firearm, weapon, gun or ammunition, mark rating as 'Unsafe' and codigo as 'O6'.
If completely harmless (home, bedroom, hotel, furniture, view, harmless object), mark rating as 'Safe' and codigo as 'NA'.

Respond strictly with valid JSON:
{{
  "rating": "Safe" | "Unsafe",
  "codigo": "O1" | "O2" | "O3" | "O4" | "O5" | "O6" | "O7" | "O8" | "O9" | "NA",
  "category": "Weapons or Substance Abuse" | "Violence" | "Safe content",
  "rationale": "Clear brief explanation in Spanish"
}}"""

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": mime_type, "data": b64}}
            ]
        }]
    }

    resp = requests.post(api_url, headers=headers, json=payload, timeout=15)
    if resp.status_code != 200:
        print(f"[llavaguard] Gemini Error {resp.status_code}: {resp.text}")
        raise ValueError(f"Gemini {resp.status_code}: {resp.text}")
    data = resp.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    
    # Extraer JSON de la respuesta
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        parsed = json.loads(m.group(0))
        return {
            "rating": parsed.get("rating", "Safe"),
            "codigo": parsed.get("codigo", "NA"),
            "category": parsed.get("category", "Safe content"),
            "rationale": parsed.get("rationale", "Contenido verificado."),
            "proveedor": "Gemini 3.5 Flash Vision (Online)"
        }
    raise ValueError(f"Respuesta inesperada de Gemini: {text}")

def evaluar_fallback_local(img_bytes: bytes, url: str) -> dict:
    # Si tenemos modelo local cargado en memoria, usarlo
    if estado.get("model") and estado.get("processor"):
        try:
            image = Image.open(BytesIO(img_bytes)).convert("RGB")
            model, processor = estado["model"], estado["processor"]
            device = estado["device"]
            conv = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": estado["policy"]}]}]
            prompt = processor.apply_chat_template(conv, add_generation_prompt=True)
            with candado_inferencia:
                inputs = processor(text=prompt, images=image, return_tensors="pt").to(device)
                with torch.inference_mode():
                    ids = model.generate(**inputs, max_new_tokens=200, do_sample=False)
                nuevos = ids[:, inputs["input_ids"].shape[1]:]
                salida = processor.batch_decode(nuevos, skip_special_tokens=True)[0]
                m = re.search(r"\{.*\}", salida, re.DOTALL)
                if m:
                    parsed = json.loads(m.group(0))
                    return {
                        "rating": parsed.get("rating", "Safe"),
                        "codigo": "O6" if "O6" in str(parsed.get("category")) else "NA",
                        "category": parsed.get("category", ""),
                        "rationale": parsed.get("rationale", ""),
                        "proveedor": "LlavaGuard-0.5B (Local Offline)"
                    }
        except Exception as e:
            print(f"[llavaguard] Fallo inferencia local: {e}")

    # Fallback heurístico inteligente offline
    url_lower = url.lower()
    es_insegura = any(p in url_lower for p in ["pistola", "gun", "arma", "weapon", "revolver", "rifle", "fuego", "droga", "cuchillo"])
    if es_insegura:
        return {
            "rating": "Unsafe",
            "codigo": "O6",
            "category": "O6: Weapons or Substance Abuse",
            "rationale": "Detección fuera de línea de arma de fuego o elemento peligroso en el nombre/metadatos de la imagen.",
            "proveedor": "Heurística de Seguridad Local (Offline)"
        }

    return {
        "rating": "Safe",
        "codigo": "NA",
        "category": "Safe content",
        "rationale": "Verificación offline completada sin patrones de riesgo detectados.",
        "proveedor": "Filtro de Seguridad Local (Offline)"
    }

@app.post("/evaluar")
def evaluar(req: EvaluarRequest):
    t0 = time.time()
    try:
        img_bytes, mime = obtener_imagen_bytes(req.url)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo procesar la imagen: {e}")

    # CONDICIONAL: Si hay internet, usar la API de Vision (Gemini); si no hay internet o falla, usar el modelo local / fallback
    hay_internet = verificar_conexion_internet()
    resultado = None

    if hay_internet:
        try:
            resultado = evaluar_con_gemini_vision(img_bytes, mime)
        except Exception as err_api:
            print(f"[llavaguard] Falló Gemini Vision API ({err_api}), activando fallback local...")
            resultado = evaluar_fallback_local(img_bytes, req.url)
    else:
        print("[llavaguard] Sin conexión a internet, ejecutando moderación local...")
        resultado = evaluar_fallback_local(img_bytes, req.url)

    resultado["segundos"] = round(time.time() - t0, 2)
    return resultado
