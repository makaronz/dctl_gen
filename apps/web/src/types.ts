// Base type for all parameters
export interface BaseParameter {
  id: string;
  name: string;
  label: string;
  description?: string;
  enabled: boolean; // For bypass functionality
}

// Slider (float)
export interface SliderParameter extends BaseParameter {
  type: 'slider';
  value: number;
  min: number;
  max: number;
  step: number;
}

// Checkbox (boolean)
export interface CheckboxParameter extends BaseParameter {
  type: 'checkbox';
  value: boolean;
}

// Int Slider
export interface IntSliderParameter extends BaseParameter {
  type: 'int_slider';
  value: number;
  min: number;
  max: number;
}

// Value Box (float)
export interface ValueBoxParameter extends BaseParameter {
  type: 'value_box';
  value: number;
}

// Combo Box (dropdown)
export interface ComboBoxParameter extends BaseParameter {
  type: 'combo_box';
  value: number; // The index of the selected item
  options: string[]; // e.g., ["RED", "GREEN", "BLUE"]
  optionLabels: string[]; // e.g., ["Channel Red", "Channel Green", "Channel Blue"]
}

// Color (float3)
export interface ColorParameter extends BaseParameter {
    type: 'color';
    value: { r: number; g: number; b: number };
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