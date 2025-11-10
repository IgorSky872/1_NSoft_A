import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

type WorkflowStep = 'dashboard' | 'diagnostics' | 'compiler' | 'inference';

interface WorkflowContextType {
  selectedDevice: string | null;
  currentStep: WorkflowStep;
  selectDevice: (id: string) => Promise<void>;
  unlockStep: (step: WorkflowStep) => void;
  loading: boolean;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWorkflow = async () => {
      const deviceId = localStorage.getItem('selectedDevice');
      if (deviceId) {
        try {
          const res = await api.get(`/workflow/status/${deviceId}`);
          setSelectedDevice(deviceId);
          setCurrentStep(res.data.current_step);
        } catch (err) {
          localStorage.removeItem('selectedDevice');
        }
      }
    };
    loadWorkflow();
  }, []);

  const selectDevice = async (id: string) => {
    setLoading(true);
    await api.post(`/workflow/select-device/${id}`);
    setSelectedDevice(id);
    setCurrentStep('diagnostics');
    localStorage.setItem('selectedDevice', id);
    setLoading(false);
  };

  const unlockStep = (step: WorkflowStep) => {
    setCurrentStep(step);
  };

  return (
    <WorkflowContext.Provider value={{ selectedDevice, currentStep, selectDevice, unlockStep, loading }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('useWorkflow must be used within WorkflowProvider');
  return context;
};