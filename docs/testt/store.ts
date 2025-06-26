import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { DctlParameter, DctlParameterType } from '@/types'; // Assuming types are in a separate file

interface DctlGeneratorState {
  worker: Worker | null;
  parameters: DctlParameter[];
  selectedParameterId: string | null;
  generatedCode: string;
  
  initWorker: () => void;
  addParameter: (type: DctlParameterType) => void;
  setSelectedParameter: (id: string | null) => void;
  updateParameterName: (id: string, newName: string) => void;
}

export const useDctlStore = create<DctlGeneratorState>((set, get) => ({
  worker: null,
  parameters: [],
  selectedParameterId: null,
  generatedCode: "// Add components to generate DCTL code.",

  initWorker: () => {
    const worker = new Worker(new URL('./worker/dctl-generator.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (event) => {
      set({ generatedCode: event.data });
    };
    set({ worker });
  },
  
  addParameter: (type) => {
    const newParam = { id: nanoid(), type, name: `New ${type}` };
    const newParams = [...get().parameters, newParam];
    set({ parameters: newParams });
    get().worker?.postMessage(newParams);
  },
  
  setSelectedParameter: (id) => set({ selectedParameterId: id }),

  updateParameterName: (id, newName) => {
    const newParams = get().parameters.map((param) =>
      param.id === id ? { ...param, name: newName } : param
    );
    set({ parameters: newParams });
    get().worker?.postMessage(newParams);
  },
})); 