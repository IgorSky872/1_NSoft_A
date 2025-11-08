from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.onnx_router import router as onnx_router
from app.api.auth_router import router as auth_router
from app.api.device_router import router as device_router
from app.api.compiler_router import router as compiler_router
import os

# Путь к frontend/dist
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "../../frontend/dist")

app = FastAPI(
    title="ONNX Visualizer",
    description="API for parsing and visualizing ONNX models",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(onnx_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(device_router, prefix="/api")
app.include_router(compiler_router, prefix="/api")

# Conditional mount frontend
if os.path.exists(FRONTEND_DIR) and os.path.isdir(FRONTEND_DIR):
    print(f"Frontend dist found: {FRONTEND_DIR}")
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:
    print(f"Warning: Frontend dist not found at {FRONTEND_DIR}")
    print("    Run 'npm run build' in frontend/ to generate it.")
    print("    In development, use Vite dev server: http://localhost:5173")

@app.get("/health")
def health_check():
    return {"status": "healthy"}