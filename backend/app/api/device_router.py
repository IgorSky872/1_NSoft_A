from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.device_models import Device
from app.models.workflow_models import DeviceWorkflowStatus
from app.database import get_db
from app.auth.dependencies import get_current_user  # ИЗМЕНЕНО
import uuid
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class MockDeviceConfig(BaseModel):
    core_count: int = 1
    memristors_per_core: int = 4092
    clock_frequency: int = 1000
    memory_bandwidth: int = 5
    supported_dtypes: List[str] = ["int8", "float16"]
    architecture_type: str = "simd"
    sparsity_support: bool = True
    crossbar_topology: str = "full_mesh"
    firmware_version: str = "1.0.0"
    # Neural network support
    supported_activations: List[str] = ["relu", "relu6", "leaky_relu", "tanh", "sigmoid"]
    supported_layers: List[str] = ["conv2d", "maxpool", "avgpool", "fc", "batchnorm"]
    leakage_types: List[str] = ["stuck_at_0", "stuck_at_1", "random_flip"]


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
async def create_mock_device(
        config: Optional[MockDeviceConfig] = None,
        db: Session = Depends(get_db),
        user=Depends(get_current_user)
):
    """Create a configurable mock device with neural network capabilities"""
    cfg = config or MockDeviceConfig()
    total_memristors = cfg.memristors_per_core * cfg.core_count

    mock_device = Device(
        id=f"MockDevice-{uuid.uuid4().hex[:8]}",
        status="idle",
        version="1.0",
        cores=[{"id": i, "status": "healthy"} for i in range(cfg.core_count)],
        memristors=[{"id": i, "status": "active"} for i in range(total_memristors)],
        is_mock=True,
        # Hardware specs
        clock_frequency=cfg.clock_frequency,
        memory_bandwidth=cfg.memory_bandwidth,
        supported_dtypes=cfg.supported_dtypes,
        architecture_type=cfg.architecture_type,
        sparsity_support=cfg.sparsity_support,
        crossbar_topology=cfg.crossbar_topology,
        firmware_version=cfg.firmware_version,
        # Neural network capabilities
        supported_activations=cfg.supported_activations,
        supported_layers=cfg.supported_layers,
        leakage_types=cfg.leakage_types,
    )
    db.add(mock_device)
    db.commit()
    return {
        "device": {
            "id": mock_device.id,
            "status": mock_device.status,
            "config": {
                "cores": cfg.core_count,
                "memristors_per_core": cfg.memristors_per_core,
                "total_memristors": total_memristors,
            }
        }
    }


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
        "diagnostics": device.diagnostics,
        # Все новые поля автоматически включаются в ответ
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

    # Вычисляем мемристоры на ядро для отображения
    memristors_per_core = 0
    if device.cores and device.memristors:
        memristors_per_core = len(device.memristors) // len(device.cores)

    return {
        "id": device.id,
        "status": device.status,
        "version": device.version,
        "is_mock": device.is_mock,
        "diagnostics": device.diagnostics,
        "memristors": device.memristors,
        "cores": device.cores,
        "clock_frequency": device.clock_frequency,
        "memory_bandwidth": device.memory_bandwidth,
        "supported_dtypes": device.supported_dtypes,
        "architecture_type": device.architecture_type,
        "sparsity_support": device.sparsity_support,
        "crossbar_topology": device.crossbar_topology,
        "firmware_version": device.firmware_version,
        "supported_activations": device.supported_activations,
        "supported_layers": device.supported_layers,
        "leakage_types": device.leakage_types,
        "memristors_per_core": memristors_per_core,
        "created_at": device.created_at if hasattr(device, 'created_at') else None,
        "updated_at": device.updated_at if hasattr(device, 'updated_at') else None
    }


@router.put("/devices/{device_id}/config")
async def update_device_config(
        device_id: str,
        config: MockDeviceConfig,
        db: Session = Depends(get_db),
        user=Depends(get_current_user)
):
    """Update mock device configuration"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(404, "Device not found")

    if not device.is_mock:
        raise HTTPException(403, "Only mock devices can be reconfigured")

    # Update hardware fields
    device.clock_frequency = config.clock_frequency
    device.memory_bandwidth = config.memory_bandwidth
    device.supported_dtypes = config.supported_dtypes
    device.architecture_type = config.architecture_type
    device.sparsity_support = config.sparsity_support
    device.crossbar_topology = config.crossbar_topology
    device.firmware_version = config.firmware_version

    # Update neural network fields
    device.supported_activations = config.supported_activations
    device.supported_layers = config.supported_layers
    device.leakage_types = config.leakage_types

    # Recreate cores and memristors with new dimensions
    device.cores = [{"id": i, "status": "healthy"} for i in range(config.core_count)]
    total_memristors = config.memristors_per_core * config.core_count
    device.memristors = [{"id": i, "status": "active"} for i in range(total_memristors)]

    db.commit()
    return {"status": "updated", "device_id": device_id}