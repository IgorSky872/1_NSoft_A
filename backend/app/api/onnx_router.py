from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.onnx_parser import parse_onnx_model
from app.models.onnx_models import ParsedOnnxResponse
from app.auth.dependencies import get_current_user
import io

router = APIRouter()

@router.post("/parse-onnx", response_model=ParsedOnnxResponse)
async def parse_onnx(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    try:
        content = await file.read()
        model_stream = io.BytesIO(content)
        parsed_data = parse_onnx_model(model_stream)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing ONNX: {str(e)}")