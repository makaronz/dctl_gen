import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDctlStore } from "@/features/dctl-generator/store";

export function PropertiesPanel() {
  const { selectedParameterId, parameters, updateParameterName } = useDctlStore();
  const selectedParameter = parameters.find((p) => p.id === selectedParameterId);

  if (!selectedParameter) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Select a parameter to edit its properties.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label htmlFor="param-name">Parameter Name</Label>
        <Input
          id="param-name"
          value={selectedParameter.name}
          onChange={(e) => updateParameterName(selectedParameter.id, e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
    </div>
  );
} 