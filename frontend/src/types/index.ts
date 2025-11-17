// frontend/src/types/index.ts

// ===== АУТЕНТИФИКАЦИЯ =====
export interface User {
  username: string;
  role?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ===== УСТРОЙСТВА =====
export interface DeviceCore {
  id: number;
  status: string;
}

export interface DeviceMemristor {
  id: number;
  status: string;
}

export interface Device {
  id: string;
  status: 'idle' | 'busy' | 'error';
  version: string;
  cores?: DeviceCore[];
  memristors?: DeviceMemristor[];
  diagnostics?: DeviceDiagnostics;
  is_mock: boolean;
}

export interface DeviceDiagnostics {
  cores: { id: number; status: string }[];
  memristors: { available: number; total: number };
  overall_status: string;
}

// ===== WORKFLOW =====
export type WorkflowStep = 'dashboard' | 'diagnostics' | 'compiler' | 'inference';

export interface WorkflowStatus {
  device_id: string;
  current_step: WorkflowStep;
  compiled_firmware?: string | null;
}

// ===== ONNX МОДЕЛИ =====
export interface OnnxNode {
  name: string;
  op_type: string;
  inputs: string[];
  outputs: string[];
  attributes: Record<string, any>;
}

export interface OnnxEdge {
  from: string;
  to: string;
  label: string;
}

export interface OnnxWeight {
  shape: number[];
  dtype: string;
  values: number[];
}

export interface OnnxData {
  nodes: OnnxNode[];
  edges: OnnxEdge[];
  weights: Record<string, OnnxWeight>;
  model_metadata: {
    producer_name?: string;
    producer_version?: string;
    domain?: string;
    description?: string;
  };
}

export interface WeightItem {
  name: string;
  shape: number[];
  dtype: string;
  values: number[];
}

// ===== API ОТВЕТЫ =====
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ===== ПРОПСЫ КОМПОНЕНТОВ =====
export interface SidebarProps {
  isOpen: boolean;
}

export interface OnnxGraphProps {
  modelPath?: string | null;
  onnxData?: OnnxData | null;
}

export interface InferenceToolbarProps {
  onUpload: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onModelProps: () => void;
  onNodeProps: () => void;
}