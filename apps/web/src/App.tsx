import { useEffect } from 'react';
import { useDctlStore } from './features/dctl-generator/store';
import { PropertiesPanel } from './features/dctl-generator/components/PropertiesPanel';
import { DctlParameter } from './types';
import { ParameterType } from './features/dctl-generator/store';
import { Button } from './components/ui/button';
import { SlidersHorizontal, ToggleRight, Hash, CaseSensitive, Palette, List } from 'lucide-react';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { ReactPlugin } from '@stagewise-plugins/react';

const PARAMETER_ICONS: Record<ParameterType, React.ElementType> = {
  slider: SlidersHorizontal,
  checkbox: ToggleRight,
  int_slider: SlidersHorizontal,
  value_box: Hash,
  color: Palette,
  combo_box: List,
};

function Sidebar() {
  const addParameter = useDctlStore((state) => state.addParameter);
  const parameterTypes: ParameterType[] = ['slider', 'checkbox', 'int_slider', 'value_box', 'color', 'combo_box'];

  return (
    <aside className="bg-gray-800 p-2 flex flex-col items-center space-y-2 border-r border-gray-700">
      {parameterTypes.map((type) => {
        const Icon = PARAMETER_ICONS[type];
        return (
          <Button key={type} variant="ghost" size="icon" onClick={() => addParameter(type)} title={`Add ${type}`}>
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </aside>
  );
}

function CodePanel() {
  const generatedCode = useDctlStore((state) => state.generatedCode);
  return (
    <div className="bg-gray-900 text-white font-mono text-sm p-4 rounded-lg h-full">
      <pre className="whitespace-pre-wrap break-all">
        <code>{generatedCode}</code>
      </pre>
    </div>
  );
}

export default function App() {
  const { initWorker } = useDctlStore();

  useEffect(() => {
    initWorker();
  }, [initWorker]);

  return (
    <>
      <div className="bg-gray-900 text-gray-200 h-screen flex flex-col font-sans">
        <header className="flex-shrink-0 h-12 flex items-center px-4 border-b border-gray-700">
          <h1 className="text-lg font-semibold">DCTL Generator</h1>
        </header>
        <div className="flex flex-grow overflow-hidden">
          <Sidebar />
          <main className="flex-grow p-4 overflow-auto">
            <PropertiesPanel />
          </main>
          <aside className="w-1/2 border-l border-gray-700 flex flex-col">
            <div className="h-3/4 p-4 flex flex-col">
              <h2 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 flex-shrink-0">Live Code Preview</h2>
              <div className="flex-grow overflow-auto">
                  <CodePanel/>
              </div>
            </div>
            <div className="h-1/4 p-4 border-t border-gray-700">
              <h2 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Preview A/B (todo)</h2>
            </div>
          </aside>
        </div>
        <footer className="flex-shrink-0 h-8 flex items-center px-4 border-t border-gray-700 text-xs text-gray-400">
          <p>Checklist: (todo)</p>
        </footer>
      </div>
      <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
    </>
  );
}
