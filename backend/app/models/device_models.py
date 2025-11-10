from sqlalchemy import Column, String, Boolean, JSON, DateTime
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
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())