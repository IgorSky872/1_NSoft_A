from sqlalchemy import Column, String, Boolean, JSON, DateTime, Integer
from sqlalchemy.sql import func
from .base import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True)
    status = Column(String, default="idle")  # idle, busy, error
    version = Column(String, default="1.0")
    cores = Column(JSON, nullable=True)
    memristors = Column(JSON, nullable=True)
    diagnostics = Column(JSON, nullable=True)
    is_mock = Column(Boolean, default=False)

    # Hardware configuration
    clock_frequency = Column(Integer, default=1000)  # MHz
    memory_bandwidth = Column(Integer, default=128)  # GB/s
    supported_dtypes = Column(JSON, default=["int8", "float16"])
    architecture_type = Column(String, default="simd")
    sparsity_support = Column(Boolean, default=True)
    crossbar_topology = Column(String, default="full_mesh")
    firmware_version = Column(String, default="1.0.0")
    power_profile = Column(JSON, default={"idle": 5, "peak": 45})
    thermal_throttling = Column(JSON, default={"enabled": True, "threshold": 85})

    # Neural network capabilities
    supported_activations = Column(JSON, default=["relu", "tanh", "sigmoid"])
    supported_layers = Column(JSON, default=["conv2d", "maxpool", "avgpool", "fc", "batchnorm"])
    leakage_types = Column(JSON, default=["stuck_at_0", "stuck_at_1"])

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())