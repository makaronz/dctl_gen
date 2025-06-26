import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDctlStore, DctlGeneratorState } from "@/features/dctl-generator/store";
import { shallow } from 'zustand/shallow';

const selectProperties = (state: DctlGeneratorState) => ({
  selectedParameterId: state.selectedParameterId,
  parameters: state.parameters,
  updateParameter: state.updateParameter,
});

export function PropertiesPanel() {
  const { selectedParameterId, parameters, updateParameter } = useDctlStore(selectProperties, shallow);

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
          onChange={(e) => updateParameter(selectedParameter.id, e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
      {/* More properties will be added here */}
    </div>
  );
} 