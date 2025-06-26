import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useDctlStore, ParameterType } from '@/features/dctl-generator/store';
import { DctlParameter } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal, ToggleRight, Hash, Palette, List, EyeOff, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DCTL_FUNCTIONS, DctlFunction } from '../dctl-constants';
import { groupBy } from 'lodash';
import { Label } from '@/components/ui/label';


const PARAMETER_ICONS: Record<ParameterType, React.ElementType> = {
  slider: SlidersHorizontal,
  checkbox: ToggleRight,
  int_slider: SlidersHorizontal,
  value_box: Hash,
  color: Palette,
  combo_box: List,
};

function ParameterControl({ parameter }: { parameter: DctlParameter }) {
  const { removeParameter, toggleParameterEnabled, updateParameter } = useDctlStore();

  const Icon = PARAMETER_ICONS[parameter.type];
  const groupedFunctions = groupBy(DCTL_FUNCTIONS, 'category');

  const handleSelectChange = (value: string) => {
    const selectedFunction = DCTL_FUNCTIONS.find((f: DctlFunction) => f.name === value);
    if (selectedFunction) {
      updateParameter(parameter.id, {
        name: selectedFunction.name,
        label: selectedFunction.label,
      });
    }
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 transition-opacity ${parameter.enabled ? 'opacity-100' : 'opacity-50'}`}>
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-400" />
            <Select onValueChange={handleSelectChange} defaultValue={parameter.name}>
              <SelectTrigger className="bg-transparent border-none p-0 h-auto text-base focus:ring-0 text-white">
                <SelectValue placeholder="Select a function..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedFunctions).map(([category, functions]: [string, DctlFunction[]]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{category}</SelectLabel>
                    {functions.map((func: DctlFunction) => (
                      <SelectItem key={func.name} value={func.name}>{func.label}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleParameterEnabled(parameter.id)}>
                {parameter.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeParameter(parameter.id)}>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {parameter.type === 'slider' && <Slider value={[parameter.value]} onValueChange={([val]) => updateParameter(parameter.id, { value: val })} min={parameter.min} max={parameter.max} step={parameter.step} />}
        {parameter.type === 'int_slider' && <Slider value={[parameter.value]} onValueChange={([val]) => updateParameter(parameter.id, { value: val })} min={parameter.min} max={parameter.max} step={1} />}
        {parameter.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
                <Switch id={`switch-${parameter.id}`} checked={parameter.value} onCheckedChange={(val) => updateParameter(parameter.id, { value: val })} />
                <Label htmlFor={`switch-${parameter.id}`}>Enabled</Label>
            </div>
        )}
        {parameter.type === 'value_box' && (
            <Input 
                type="number"
                value={parameter.value}
                onChange={(e) => updateParameter(parameter.id, { value: parseFloat(e.target.value) || 0 })}
                className="bg-gray-700 border-gray-600"
            />
        )}
        {parameter.type === 'combo_box' && (
            <Select onValueChange={(val) => updateParameter(parameter.id, { value: parseInt(val) })} defaultValue={String(parameter.value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    {parameter.optionLabels.map((label, index) => (
                        <SelectItem key={index} value={String(index)}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
        {parameter.type === 'color' && (
            <Input 
                type="color"
                value={rgbToHex(parameter.value)}
                onChange={(e) => updateParameter(parameter.id, { value: hexToRgb(e.target.value) })}
                className="w-full h-10 p-1"
            />
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions for color conversion
function rgbToHex({ r, g, b }: { r: number, g: number, b: number }): string {
    const toHex = (c: number) => `0${Math.round(c * 255).toString(16)}`.slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
    } : { r: 0, g: 0, b: 0 };
}

export function PropertiesPanel() {
  const { parameters } = useDctlStore();

  if (parameters.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Click on an icon in the left sidebar to add a parameter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {parameters.map((param) => (
        <ParameterControl key={param.id} parameter={param} />
      ))}
    </div>
  );
} 