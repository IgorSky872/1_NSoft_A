from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import asyncio
from app.models.workflow_models import DeviceWorkflowStatus, WorkflowStep
from app.database import get_db
from app.auth.dependencies import get_current_user  # ИЗМЕНЕНО

router = APIRouter()


@router.post("/flash")
async def flash_firmware(device_id: str, firmware: UploadFile = File(...), db: Session = Depends(get_db),
                         user=Depends(get_current_user)):
    workflow = db.query(DeviceWorkflowStatus).filter(DeviceWorkflowStatus.device_id == device_id).first()
    if not workflow or workflow.current_step != WorkflowStep.INFERENCE:
        raise HTTPException(403, "Compile firmware first")

    # Сохранить прошивку
    content = await firmware.read()
    flash_path = f"/tmp/flashed_{device_id}.bin"
    with open(flash_path, "wb") as f:
        f.write(content)

    return {"status": "flashed", "path": flash_path}


@router.post("/infer")
async def run_inference(device_id: str, data: UploadFile = File(...), db: Session = Depends(get_db),
                        user=Depends(get_current_user)):
    workflow = db.query(DeviceWorkflowStatus).filter(DeviceWorkflowStatus.device_id == device_id).first()
    if not workflow or workflow.current_step != WorkflowStep.INFERENCE:
        raise HTTPException(403, "Flash firmware first")

    # Мок инференса
    await asyncio.sleep(2)

    return {
        "results": [
            {
                "input": data.filename,
                "prediction": "class_3",
                "confidence": 0.95,
                "latency_ms": 45
            }
        ]
    }