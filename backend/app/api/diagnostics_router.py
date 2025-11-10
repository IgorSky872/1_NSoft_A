from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import asyncio
from app.models.device_models import Device
from app.models.workflow_models import DeviceWorkflowStatus, WorkflowStep
from app.database import get_db
from app.auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter()


class DiagnosticsRequest(BaseModel):
    device_id: str


async def run_diagnostics_task(device_id: str, db: Session):
    await asyncio.sleep(3)  # Имитация работы
    device = db.query(Device).filter(Device.id == device_id).first()
    if device:
        device.diagnostics = {
            "cores": [{"id": i, "status": "healthy"} for i in range(4)],
            "memristors": {"available": 16, "total": 16},
            "overall_status": "passed"
        }
        workflow = db.query(DeviceWorkflowStatus).filter(DeviceWorkflowStatus.device_id == device_id).first()
        if workflow:
            workflow.current_step = WorkflowStep.COMPILER
        db.commit()


@router.post("/diagnostics")
async def run_diagnostics(
        request: DiagnosticsRequest,  # Используем Pydantic модель
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
        user=Depends(get_current_user)
):
    device = db.query(Device).filter(Device.id == request.device_id).first()
    if not device:
        raise HTTPException(404, "Device not found")

    background_tasks.add_task(run_diagnostics_task, request.device_id, db)
    return {"status": "started", "message": "Diagnostics running in background"}