import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MS-04 Inteligencia Artificial & Copiloto (Aloja-Te)",
    description="Servicio de IA: Copiloto LLM, MCP, Visión por Computadora y Workflows",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ms-ia-copiloto",
        "database": "MongoDB",
        "protocols": ["REST", "MCP", "gRPC"]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3004))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
