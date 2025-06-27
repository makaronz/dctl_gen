import { BaseParameterCore, UIParameterType, ColorValue } from '../../../src/types/shared';

// Base type for UI parameters - extends shared core with UI-specific properties
export interface BaseParameter extends BaseParameterCore {
  label: string;
  description?: string;
  enabled: boolean; // For bypass functionality
}

// Slider (float)
export interface SliderParameter extends BaseParameter {
  type: Extract<UIParameterType, 'slider'>;
  value: number;
  min: number;
  max: number;
  step: number;
}

// Checkbox (boolean)
export interface CheckboxParameter extends BaseParameter {
  type: Extract<UIParameterType, 'checkbox'>;
  value: boolean;
}

// Int Slider
export interface IntSliderParameter extends BaseParameter {
  type: Extract<UIParameterType, 'int_slider'>;
  value: number;
  min: number;
  max: number;
}

// Value Box (float)
export interface ValueBoxParameter extends BaseParameter {
  type: Extract<UIParameterType, 'value_box'>;
  value: number;
}

// Combo Box (dropdown)
export interface ComboBoxParameter extends BaseParameter {
  type: Extract<UIParameterType, 'combo_box'>;
  value: number; // The index of the selected item
  options: string[]; // e.g., ["RED", "GREEN", "BLUE"]
  optionLabels: string[]; // e.g., ["Channel Red", "Channel Green", "Channel Blue"]
}

// Color (float3)
export interface ColorParameter extends BaseParameter {
    type: Extract<UIParameterType, 'color'>;
    value: ColorValue;
}

// A union of all possible parameter types
export type DctlParameter =
  | SliderParameter
  | CheckboxParameter
  | IntSliderParameter
  | ValueBoxParameter
  | ComboBoxParameter
  | ColorParameter;

// The main project structure
export interface DctlProject {
  id: string;
  name: string;
  parameters: DctlParameter[];
} 