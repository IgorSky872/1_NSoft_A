from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.device_models import Device
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