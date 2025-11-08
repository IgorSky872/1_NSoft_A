import onnx
import numpy as np
import io
from onnx import AttributeProto

def parse_onnx_model(model_stream: io.BytesIO) -> dict:
    model = onnx.load(model_stream)
    graph = model.graph

    # Извлекаем узлы (nodes) для графа
    nodes = []
    for node in graph.node:
        attributes = {}
        for attr in node.attribute:
            if attr.type == AttributeProto.FLOAT:  # 1
                attributes[attr.name] = attr.f
            elif attr.type == AttributeProto.INT:  # 2
                attributes[attr.name] = attr.i
            elif attr.type == AttributeProto.STRING:  # 3
                attributes[attr.name] = attr.s.decode('utf-8')
            elif attr.type == AttributeProto.FLOATS:  # 6
                attributes[attr.name] = list(attr.floats)
            elif attr.type == AttributeProto.INTS:  # 7
                attributes[attr.name] = list(attr.ints)
            elif attr.type == AttributeProto.STRINGS:  # 8
                attributes[attr.name] = [s.decode('utf-8') for s in attr.strings]
            elif attr.type == AttributeProto.TENSOR:  # 4
                tensor = onnx.numpy_helper.to_array(attr.t)
                attributes[attr.name] = {
                    "type": "tensor",
                    "shape": list(tensor.shape),
                    #"values": tensor.flatten().tolist()[:100]  # Preview
                    "values": tensor.flatten().tolist()
                }
            else:
                attributes[attr.name] = f"unsupported type {attr.type}"  # Строка для других

        node_data = {
            "name": node.name or node.op_type,
            "op_type": node.op_type,
            "inputs": list(node.input),
            "outputs": list(node.output),
            "attributes": attributes
        }
        nodes.append(node_data)

    # Извлекаем связи (edges)
    edges = []
    for node in graph.node:
        for input_name in node.input:
            for source_node in graph.node:
                if input_name in source_node.output:
                    edges.append({
                        "from": source_node.name or source_node.op_type,
                        "to": node.name or node.op_type,
                        "label": input_name
                    })

    # Извлекаем веса (initializers)
    weights = {}
    for init in graph.initializer:
        tensor = onnx.numpy_helper.to_array(init)
        weights[init.name] = {
            "shape": list(tensor.shape),
            "dtype": str(tensor.dtype),
            #"values": tensor.flatten().tolist()[:100]  # Ограничиваем для preview
            "values": tensor.flatten().tolist()
        }

    # Возвращаем данные
    return {
        "nodes": nodes,
        "edges": edges,
        "weights": weights,
        "model_metadata": {
            "producer_name": model.producer_name,
            "producer_version": model.producer_version,
            "domain": model.domain,
            "description": model.doc_string
        }
    }