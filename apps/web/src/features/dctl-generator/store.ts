import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { DctlParameter } from '../../types';
import { UIParameterType } from '../../../../../src/types/shared';

export type ParameterType = UIParameterType;

interface DctlGeneratorState {
  worker: Worker | null;
  parameters: DctlParameter[];
  generatedCode: string;

  initWorker: () => void;
  addParameter: (type: ParameterType) => void;
  removeParameter: (id: string) => void;
  updateParameter: (id: string, newValues: Partial<DctlParameter>) => void;
  toggleParameterEnabled: (id: string) => void;
  exportDctl: (filename?: string) => void;
  copyToClipboard: () => Promise<void>;
}


export const useDctlStore = create(
  immer<DctlGeneratorState>((set, get) => ({
    worker: null,
    parameters: [],
    generatedCode: '// Click on the sidebar to add a parameter.',

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
      let newParam: DctlParameter;
      const base = { id: nanoid(), name: `param_${nanoid(6)}`, label: `New ${type}`, enabled: true };

      switch (type) {
          case 'slider':
              newParam = { ...base, type, value: 0.5, min: 0, max: 1, step: 0.01 };
              break;
          case 'checkbox':
              newParam = { ...base, type, value: true };
              break;
          case 'int_slider':
              newParam = { ...base, type, value: 5, min: 0, max: 10 };
              break;
          case 'value_box':
              newParam = { ...base, type, value: 1.0 };
              break;
          case 'combo_box':
              newParam = { ...base, type, value: 0, options: ['OPT_1', 'OPT_2'], optionLabels: ['Option 1', 'Option 2'] };
              break;
          case 'color':
              newParam = { ...base, type, value: {r: 1, g: 1, b: 1}};
              break;
      }
      
      set(state => {
        state.parameters.push(newParam);
      });
      get().worker?.postMessage(get().parameters);
    },

    removeParameter: (id) => {
      set(state => {
        state.parameters = state.parameters.filter(p => p.id !== id);
      });
      get().worker?.postMessage(get().parameters);
    },
    
    updateParameter: (id, newValues) => {
      set((state) => {
        const param = state.parameters.find((p) => p.id === id);
        if (param) {
          Object.assign(param, newValues);
        }
      });
      get().worker?.postMessage(get().parameters);
    },
    
    toggleParameterEnabled: (id) => {
      set(state => {
        const param = state.parameters.find(p => p.id === id);
        if (param) {
            param.enabled = !param.enabled;
        }
      });
      get().worker?.postMessage(get().parameters);
    },

    exportDctl: (filename = 'generated_transform.dctl') => {
      const { generatedCode } = get();
      const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.dctl') ? filename : `${filename}.dctl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    },

    copyToClipboard: async () => {
      const { generatedCode } = get();
      try {
        await navigator.clipboard.writeText(generatedCode);
        return Promise.resolve();
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve();
      }
    }
  }))
); 