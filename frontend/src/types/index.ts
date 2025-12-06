// frontend/src/types/index.ts

// ===== АУТЕНТИФИКАЦИЯ =====
export interface User {
  username: string;
  role?: string;
  loginTime?: number;
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
  status: string;
  version: string;
  is_mock: boolean;
  diagnostics?: DeviceDiagnostics;
  memristors?: Memristor[];
  cores?: Core[];

  // Hardware specs (optional for backward compatibility)
  clock_frequency?: number;
  memory_bandwidth?: number;
  supported_dtypes?: string[];
  architecture_type?: string;
  sparsity_support?: boolean;
  crossbar_topology?: string;
  firmware_version?: string;
  power_profile?: { idle: number; peak: number };
  thermal_throttling?: { enabled: boolean; threshold: number };

  // Neural network capabilities
  supported_activations?: string[];
  supported_layers?: string[];
  leakage_types?: string[];
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

// ===== КОНФИГУРАЦИЯ MOCK-УСТРОЙСТВА =====
export interface MockDeviceConfig {
  core_count: number;
  memristors_per_core: number;
  clock_frequency: number;
  memory_bandwidth: number;
  supported_dtypes: string[];
  architecture_type: string;
  sparsity_support: boolean;
  crossbar_topology: string;
  firmware_version: string;
  // Neural network support
  supported_activations: string[];
  supported_layers: string[];
  leakage_types: string[];
}