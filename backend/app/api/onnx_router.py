from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.onnx_parser import parse_onnx_model
from app.models.onnx_models import ParsedOnnxResponse
from app.auth.utils import verify_token_dep as verify_token
import io

router = APIRouter()

@router.post("/parse-onnx", response_model=ParsedOnnxResponse)
async def parse_onnx(file: UploadFile = File(...), token: dict = Depends(verify_token)):
    try:
        content = await file.read()
        model_stream = io.BytesIO(content)
        parsed_data = parse_onnx_model(model_stream)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing ONNX: {str(e)}")