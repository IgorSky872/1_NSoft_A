from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType
import uuid
import os
from app.models.workflow_models import DeviceWorkflowStatus, WorkflowStep
from app.database import get_db
from app.auth.dependencies import get_current_user  # ИЗМЕНЕНО

router = APIRouter()


@router.post("/quantize")
async def quantize_model(file: UploadFile = File(...), quant_type: str = "int8"):
    content = await file.read()
    model = onnx.load_from_string(content)

    # Валидация
    try:
        onnx.checker.check_model(model)
    except Exception as e:
        raise HTTPException(400, f"Invalid ONNX model: {str(e)}")

    # Сохранение оригинала
    original_path = f"/tmp/original_{uuid.uuid4().hex}.onnx"
    with open(original_path, "wb") as f:
        f.write(content)

    # Квантизация
    quantized_path = f"/tmp/quantized_{uuid.uuid4().hex}.onnx"
    quantize_dynamic(
        original_path,
        quantized_path,
        weight_type=QuantType.QInt8 if quant_type == "int8" else QuantType.QUInt8
    )

    return {
        "original_path": original_path,
        "quantized_path": quantized_path,
        "size_reduction": f"{os.path.getsize(quantized_path) / os.path.getsize(original_path) * 100:.1f}%"
    }


@router.post("/compile")
async def compile_firmware(device_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    workflow = db.query(DeviceWorkflowStatus).filter(DeviceWorkflowStatus.device_id == device_id).first()
    if not workflow or workflow.current_step != WorkflowStep.COMPILER:
        raise HTTPException(403, "Complete diagnostics first")

    # Мок компиляции
    firmware_path = f"/tmp/firmware_{device_id}_{uuid.uuid4().hex}.bin"
    with open(firmware_path, "w") as f:
        f.write("mock_firmware_data")

    workflow.compiled_firmware = firmware_path
    workflow.current_step = WorkflowStep.INFERENCE
    db.commit()

    return {"status": "compiled", "firmware_path": firmware_path}