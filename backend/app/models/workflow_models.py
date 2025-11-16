from sqlalchemy import Column, String, Enum as SQLEnum
from .base import Base
import enum


class WorkflowStep(str, enum.Enum):
    DASHBOARD = "dashboard"
    DIAGNOSTICS = "diagnostics"
    COMPILER = "compiler"
    INFERENCE = "inference"


class DeviceWorkflowStatus(Base):
    __tablename__ = "workflow_status"

    device_id = Column(String, primary_key=True, index=True)
    current_step = Column(SQLEnum(WorkflowStep), default=WorkflowStep.DASHBOARD)
    compiled_firmware = Column(String, nullable=True)