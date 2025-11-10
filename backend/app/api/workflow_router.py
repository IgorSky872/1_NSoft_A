from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.workflow_models import DeviceWorkflowStatus, WorkflowStep
from app.models.device_models import Device
from app.database import get_db
from app.auth.dependencies import get_current_user  # ИЗМЕНЕНО

router = APIRouter()


@router.post("/select-device/{device_id}")
async def select_device(device_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(404, "Device not found")

    workflow = db.query(DeviceWorkflowStatus).filter(DeviceWorkflowStatus.device_id == device_id).first()
    if not workflow:
        workflow = DeviceWorkflowStatus(device_id=device_id, current_step=WorkflowStep.DIAGNOSTICS)
        db.add(workflow)
    else:
        workflow.current_step = WorkflowStep.DIAGNOSTICS

    db.commit()
    return {"status": "selected", "device_id": device_id, "next_step": "diagnostics"}


@router.get("/status/{device_id}")
async def get_status(device_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    workflow = db.query(DeviceWorkflowStatus).filter(DeviceWorkflowStatus.device_id == device_id).first()
    if not workflow:
        raise HTTPException(404, "Workflow not found")
    return {"device_id": device_id, "current_step": workflow.current_step}


@router.post("/unlock-step/{device_id}/{step}")
async def unlock_step(device_id: str, step: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    workflow = db.query(DeviceWorkflowStatus).filter(DeviceWorkflowStatus.device_id == device_id).first()
    if not workflow:
        raise HTTPException(404, "Workflow not found")

    try:
        workflow.current_step = WorkflowStep(step)
        db.commit()
        return {"status": "unlocked", "step": step}
    except ValueError:
        raise HTTPException(400, "Invalid step")