from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.device_models import Device
from app.models.workflow_models import DeviceWorkflowStatus
from app.database import get_db
from app.auth.dependencies import get_current_user  # ИЗМЕНЕНО
import uuid

router = APIRouter()


@router.get("/devices")
async def get_devices(db: Session = Depends(get_db), user=Depends(get_current_user)):
    devices = db.query(Device).all()
    if not devices:
        mock_device = Device(
            id=f"MockDevice-{uuid.uuid4().hex[:8]}",
            status="idle",
            version="1.0",
            cores=[{"id": i, "status": "healthy"} for i in range(4)],
            memristors=[{"id": i, "status": "active"} for i in range(16)],
            is_mock=True
        )
        db.add(mock_device)
        db.commit()
        devices = [mock_device]

    return {"devices": [{"id": d.id, "status": d.status, "version": d.version, "is_mock": d.is_mock} for d in devices]}


@router.post("/devices/mock")
async def create_mock_device(db: Session = Depends(get_db), user=Depends(get_current_user)):
    mock_device = Device(
        id=f"TestDevice-{uuid.uuid4().hex[:8]}",
        status="idle",
        version="1.0",
        cores=[{"id": i, "status": "healthy"} for i in range(8)],
        memristors=[{"id": i, "status": "active"} for i in range(32)],
        is_mock=True
    )
    db.add(mock_device)
    db.commit()
    return {"device": {"id": mock_device.id, "status": mock_device.status}}

@router.get("/devices/{device_id}")
async def get_device(device_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(404, "Device not found")
    return {
        "id": device.id,
        "status": device.status,
        "version": device.version,
        "is_mock": device.is_mock,
        "diagnostics": device.diagnostics
    }


@router.delete("/devices/{device_id}")
async def delete_device(
        device_id: str,
        db: Session = Depends(get_db),
        user=Depends(get_current_user)
):
    """Delete a device by ID"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(404, "Device not found")

    # Удаляем связанные workflow статусы
    workflows = db.query(DeviceWorkflowStatus).filter(
        DeviceWorkflowStatus.device_id == device_id
    ).all()

    for workflow in workflows:
        db.delete(workflow)

    # Удаляем само устройство
    db.delete(device)
    db.commit()

    return {"message": "Device deleted successfully"}


@router.get("/devices/{device_id}/details")
async def get_device_details(
        device_id: str,
        db: Session = Depends(get_db),
        user=Depends(get_current_user)
):
    """Get detailed information about a specific device"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(404, "Device not found")

    return {
        "id": device.id,
        "status": device.status,
        "version": device.version,
        "is_mock": device.is_mock,
        "diagnostics": device.diagnostics,
        "memristors": device.memristors,
        "cores": device.cores,
        "created_at": device.created_at if hasattr(device, 'created_at') else None,
        "updated_at": device.updated_at if hasattr(device, 'updated_at') else None
    }