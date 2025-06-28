import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Slider } from '../../../components/ui/slider';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ParsedDctlParameter, ParameterGroup, ParameterCategory } from '../types/ParsedParameter';

interface DctlParameterExtractorProps {
  parameterGroups: ParameterGroup[];
  onParameterUpdate: (parameterId: string, newValue: number | boolean | string) => void;
  onParameterReset: (parameterId: string) => void;
  onResetAll: () => void;
  onToggleGroup: (category: ParameterCategory) => void;
  isLoading?: boolean;
}

export const DctlParameterExtractor: React.FC<DctlParameterExtractorProps> = ({
  parameterGroups,
  onParameterUpdate,
  onParameterReset,
  onResetAll,
  onToggleGroup,
  isLoading = false
}) => {
  
  if (parameterGroups.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">No parameters found</p>
            <p className="text-xs text-gray-400 mt-1">Load a DCTL file with DEFINE_UI_PARAMS to see controls</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalParameters = parameterGroups.reduce((total, group) => total + group.parameters.length, 0);
  const hasModifiedValues = parameterGroups.some(group => 
    group.parameters.some(param => param.currentValue !== param.defaultValue)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Auto-Generated Controls ({totalParameters})
            </CardTitle>
            {hasModifiedValues && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetAll}
                disabled={isLoading}
                className="text-orange-600 hover:text-orange-700"
              >
                Reset All
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Parameter Groups */}
      {parameterGroups.map((group) => (
        <Card key={group.category} className="overflow-hidden">
          <CardHeader 
            className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onToggleGroup(group.category)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <CategoryIcon category={group.category} />
                <span>{group.displayName}</span>
                <span className="text-sm font-normal text-gray-500">
                  ({group.parameters.length})
                </span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {group.parameters.some(p => p.currentValue !== p.defaultValue) && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Modified values" />
                )}
                <svg 
                  className={`w-4 h-4 transition-transform ${group.isExpanded ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardHeader>
          
          {group.isExpanded && (
            <CardContent className="space-y-4">
              {group.parameters.map((param) => (
                <ParameterControl
                  key={param.id}
                  parameter={param}
                  onUpdate={onParameterUpdate}
                  onReset={onParameterReset}
                  disabled={isLoading}
                />
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

// Individual parameter control component
interface ParameterControlProps {
  parameter: ParsedDctlParameter;
  onUpdate: (parameterId: string, newValue: number | boolean | string) => void;
  onReset: (parameterId: string) => void;
  disabled?: boolean;
}

const ParameterControl: React.FC<ParameterControlProps> = ({
  parameter,
  onUpdate,
  onReset,
  disabled = false
}) => {
  const isModified = parameter.currentValue !== parameter.defaultValue;

  const renderControl = () => {
    switch (parameter.type) {
      case 'DCTLUI_SLIDER_FLOAT':
        return (
          <SliderControl
            parameter={parameter}
            onUpdate={onUpdate}
            disabled={disabled}
          />
        );
        
      case 'DCTLUI_SLIDER_INT':
        return (
          <SliderControl
            parameter={parameter}
            onUpdate={onUpdate}
            disabled={disabled}
            isInteger={true}
          />
        );
        
      case 'DCTLUI_CHECK_BOX':
        return (
          <CheckboxControl
            parameter={parameter}
            onUpdate={onUpdate}
            disabled={disabled}
          />
        );
        
      case 'DCTLUI_COMBO_BOX':
        return (
          <ComboControl
            parameter={parameter}
            onUpdate={onUpdate}
            disabled={disabled}
          />
        );
        
      case 'DCTLUI_VALUE_BOX':
        return (
          <ValueBoxControl
            parameter={parameter}
            onUpdate={onUpdate}
            disabled={disabled}
          />
        );
        
      default:
        return (
          <div className="text-sm text-gray-500">
            Unsupported parameter type: {parameter.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Parameter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">
            {parameter.displayName}
          </Label>
          {isModified && (
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" title="Modified" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {String(parameter.currentValue)}
          </span>
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReset(parameter.id)}
              disabled={disabled}
              className="h-6 px-2 text-xs text-gray-500 hover:text-orange-600"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
      
      {/* Control */}
      <div className="space-y-1">
        {renderControl()}
        
        {/* Parameter Info */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Default: {String(parameter.defaultValue)}</span>
          <span>Line {parameter.lineNumber}</span>
        </div>
      </div>
    </div>
  );
};

// Slider control component
interface SliderControlProps {
  parameter: ParsedDctlParameter;
  onUpdate: (parameterId: string, newValue: number) => void;
  disabled?: boolean;
  isInteger?: boolean;
}

const SliderControl: React.FC<SliderControlProps> = ({
  parameter,
  onUpdate,
  disabled = false,
  isInteger = false
}) => {
  const min = parameter.min ?? 0;
  const max = parameter.max ?? 1;
  const step = isInteger ? 1 : (parameter.step ?? 0.01);
  const currentValue = Number(parameter.currentValue);

  return (
    <div className="space-y-2">
      <Slider
        value={[currentValue]}
        onValueChange={(values) => onUpdate(parameter.id, values[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Checkbox control component
interface CheckboxControlProps {
  parameter: ParsedDctlParameter;
  onUpdate: (parameterId: string, newValue: boolean) => void;
  disabled?: boolean;
}

const CheckboxControl: React.FC<CheckboxControlProps> = ({
  parameter,
  onUpdate,
  disabled = false
}) => {
  const isChecked = Boolean(parameter.currentValue);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isChecked}
        onCheckedChange={(checked) => onUpdate(parameter.id, checked)}
        disabled={disabled}
      />
      <span className="text-sm text-gray-600">
        {isChecked ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
};

// Combo box control component
interface ComboControlProps {
  parameter: ParsedDctlParameter;
  onUpdate: (parameterId: string, newValue: number) => void;
  disabled?: boolean;
}

const ComboControl: React.FC<ComboControlProps> = ({
  parameter,
  onUpdate,
  disabled = false
}) => {
  const currentIndex = Number(parameter.currentValue);
  const options = parameter.options || [];
  const optionLabels = parameter.optionLabels || options;

  // Debug logging
  console.log('ComboControl Debug:', {
    parameterName: parameter.name,
    options,
    optionLabels,
    currentIndex
  });

  // If no options, show error state
  if (options.length === 0) {
    return (
      <div className="text-sm text-red-500 p-2 border border-red-200 rounded">
        No options found for {parameter.name}
      </div>
    );
  }

  return (
    <Select
      value={String(currentIndex)}
      onValueChange={(value) => onUpdate(parameter.id, Number(value))}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={optionLabels[currentIndex] || 'Select option'} />
      </SelectTrigger>
      <SelectContent>
        {optionLabels.map((label, index) => (
          <SelectItem key={index} value={String(index)}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Value box control component
interface ValueBoxControlProps {
  parameter: ParsedDctlParameter;
  onUpdate: (parameterId: string, newValue: number) => void;
  disabled?: boolean;
}

const ValueBoxControl: React.FC<ValueBoxControlProps> = ({
  parameter,
  onUpdate,
  disabled = false
}) => {
  return (
    <Input
      type="number"
      value={String(parameter.currentValue)}
      onChange={(e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
          onUpdate(parameter.id, value);
        }
      }}
      disabled={disabled}
      className="w-full"
    />
  );
};

// Category icon component
const CategoryIcon: React.FC<{ category: ParameterCategory }> = ({ category }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (category) {
    case 'exposure':
      return (
        <svg {...iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      );
    case 'color':
      return (
        <svg {...iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2V4h8a2 2 0 00-2-2H4z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M6 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V4zm2 0h8v8H8V4z" clipRule="evenodd" />
        </svg>
      );
    case 'curves':
      return (
        <svg {...iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
  }
}; 