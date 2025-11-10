from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.base import Base

# Импорт роутеров
from app.api.auth_router import router as auth_router
from app.api.compiler_router import router as compiler_router
from app.api.device_router import router as device_router
from app.api.inference_router import router as inference_router
from app.api.workflow_router import router as workflow_router
from app.api.diagnostics_router import router as diagnostics_router

# Создать таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NSoft AI Compiler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключить роутеры
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(device_router, prefix="/api", tags=["devices"])
app.include_router(workflow_router, prefix="/api/workflow", tags=["workflow"])
app.include_router(diagnostics_router, prefix="/api", tags=["diagnostics"])
app.include_router(compiler_router, prefix="/api", tags=["compiler"])
app.include_router(inference_router, prefix="/api", tags=["inference"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}