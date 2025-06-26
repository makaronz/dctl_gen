import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal, CheckSquare, List } from "lucide-react";
import { useDctlStore } from "@/features/dctl-generator/store";
import { PropertiesPanel } from "@/features/dctl-generator/components/PropertiesPanel";
import { DctlParameter } from "@/types";
import './App.css';

function App() {
  const { 
    parameters, 
    generatedCode, 
    addParameter, 
    setSelectedParameter, 
    initWorker 
  } = useDctlStore();

  useEffect(() => {
    initWorker();
  }, [initWorker]);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white font-sans">
      <aside className="w-1/4 max-w-xs min-w-[250px] bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
        <h2 className="text-lg font-bold mb-4">Components</h2>
        <div className="space-y-4">
          <Card
            className="bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer"
            onClick={() => addParameter("slider")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <span>Slider</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer"
            onClick={() => addParameter("checkbox")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare size={18} />
                <span>Checkbox</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer"
            onClick={() => addParameter("dropdown")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List size={18} />
                <span>Dropdown</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col p-4">
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Workspace</h2>
            <Button>Export .dctl</Button>
          </header>
          <div className="flex-1 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 space-y-2 overflow-auto">
            {parameters.map((param: DctlParameter) => (
              <div
                key={param.id}
                className="bg-gray-700 p-3 rounded text-sm cursor-pointer hover:bg-gray-600"
                onClick={() => setSelectedParameter(param.id)}
              >
                {param.name} ({param.type})
              </div>
            ))}
          </div>
        </main>
        <aside className="h-1/3 bg-gray-800 p-4 border-t-2 border-gray-700 overflow-auto">
          <h2 className="text-lg font-bold mb-4">Properties</h2>
          <PropertiesPanel />
        </aside>
      </div>

      <aside className="w-1/3 max-w-lg min-w-[400px] bg-black p-4 border-l border-gray-700 flex flex-col">
        <h2 className="text-lg font-bold mb-4">Live Code Preview</h2>
        <div className="flex-1 bg-gray-900 rounded-lg p-2 font-mono text-sm overflow-auto">
          <pre><code>{generatedCode}</code></pre>
        </div>
      </aside>
    </div>
  );
}

export default App;
