from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Node(BaseModel):
    name: str = Field(..., description="Name of the node (or op_type if unnamed)")
    op_type: str = Field(..., description="Operation type (e.g., Conv, Relu)")
    inputs: List[str] = Field(..., description="Input tensor names")
    outputs: List[str] = Field(..., description="Output tensor names")
    attributes: Dict[str, Any] = Field(..., description="Node attributes (e.g., kernel_size)")

class Edge(BaseModel):
    from_: str = Field(..., alias="from", description="Source node name")  # 'from' is reserved, use alias
    to: str = Field(..., description="Target node name")
    label: str = Field(..., description="Tensor name connecting them")

class Weight(BaseModel):
    shape: List[int] = Field(..., description="Tensor shape")
    dtype: str = Field(..., description="Data type (e.g., float32)")
    values: List[float] = Field(..., description="Flattened values preview (limited)")

class ModelMetadata(BaseModel):
    producer_name: Optional[str] = None
    producer_version: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None

class ParsedOnnxResponse(BaseModel):
    nodes: List[Node] = Field(..., description="List of graph nodes")
    edges: List[Edge] = Field(..., description="List of graph edges")
    weights: Dict[str, Weight] = Field(..., description="Model weights (initializers)")
    model_metadata: ModelMetadata = Field(..., description="Model metadata")