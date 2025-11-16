# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.base import Base
from dotenv import load_dotenv  # ← Добавьте импорт
import os

# Загружаем переменные из .env файла
load_dotenv()

# Создать таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NSoft AI Compiler")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ← Используйте конкретный список вместо "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Импорт и подключение роутеров...
from app.api.auth_router import router as auth_router
from app.api.compiler_router import router as compiler_router
from app.api.device_router import router as device_router
from app.api.inference_router import router as inference_router
from app.api.workflow_router import router as workflow_router
from app.api.diagnostics_router import router as diagnostics_router
from app.api.onnx_router import router as onnx_router

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(device_router, prefix="/api", tags=["devices"])
app.include_router(workflow_router, prefix="/api/workflow", tags=["workflow"])
app.include_router(diagnostics_router, prefix="/api", tags=["diagnostics"])
app.include_router(compiler_router, prefix="/api/compiler", tags=["compiler"])
app.include_router(inference_router, prefix="/api", tags=["inference"])
app.include_router(onnx_router, prefix="/api", tags=["onnx"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}