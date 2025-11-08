# backend/app/api/device_router.py

from fastapi import APIRouter, Depends
from app.utils.jwt_utils import verify_token

router = APIRouter()

@router.get("/devices")
async def get_devices(token: dict = Depends(verify_token)):
    # Заглушка: Возвращаем mock список устройств
    return {
        "devices": [
            {"id": "device1", "status": "online", "version": "1.0"},
            {"id": "device2", "status": "offline", "version": "0.9"}
        ]
    }