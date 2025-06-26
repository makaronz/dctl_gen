import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export type DctlParameterType = 'slider' | 'checkbox' | 'dropdown';

export interface DctlParameter {
  id: string;
  type: DctlParameterType;
  name: string;
}

export interface DctlGeneratorState {
  worker: Worker | null;
  parameters: DctlParameter[];
  generatedCode: string;
  selectedParameterId: string | null;
  initWorker: () => void;
  postToWorker: (params: DctlParameter[]) => void;
  addParameter: (type: DctlParameterType) => void;
  setSelectedParameter: (id: string | null) => void;
  updateParameter: (id: string, newName: string) => void;
  setGeneratedCode: (code: string) => void;
}

export const useDctlStore = create<DctlGeneratorState>()(
  devtools(
    immer((set, get) => ({
      worker: null,
      parameters: [],
      generatedCode: "// Code will be generated here...",
      selectedParameterId: null,
      initWorker: () => {
        const worker = new Worker(new URL('./worker/dctl-generator.worker.ts', import.meta.url), {
          type: 'module',
        });
        
        worker.onmessage = (event) => {
          set({ generatedCode: event.data });
        };

        set({ worker });
      },
      postToWorker: (params) => {
        const worker = get().worker;
        if (worker) {
          worker.postMessage(params);
        }
      },
      addParameter: (type) =>
        set((state) => {
          const newParam: DctlParameter = { id: nanoid(), type, name: `New ${type}` };
          state.parameters.push(newParam);
        }),
      setSelectedParameter: (id) => set({ selectedParameterId: id }),
      updateParameter: (id, newName) =>
        set((state) => {
          const param = state.parameters.find((p) => p.id === id);
          if (param) {
            param.name = newName;
          }
        }),
      setGeneratedCode: (code) => set({ generatedCode: code }),
    })),
  ),
); 