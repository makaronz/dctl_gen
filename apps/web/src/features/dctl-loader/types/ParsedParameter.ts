export type DctlUIType = 
  | 'DCTLUI_SLIDER_FLOAT'
  | 'DCTLUI_SLIDER_INT' 
  | 'DCTLUI_CHECK_BOX'
  | 'DCTLUI_COMBO_BOX'
  | 'DCTLUI_VALUE_BOX';

export interface ParsedDctlParameter {
  id: string;
  name: string;                    // parameter variable name
  displayName: string;             // user-friendly label
  type: DctlUIType;               // UI control type
  defaultValue: number | boolean | string;  // default value from DCTL
  currentValue: number | boolean | string;  // current modified value
  
  // For numeric parameters (sliders, value boxes)
  min?: number;
  max?: number;
  step?: number;
  
  // For combo boxes
  options?: string[];              // enum values {opt1, opt2}
  optionLabels?: string[];         // display labels {Label 1, Label 2}
  
  // Metadata
  lineNumber: number;              // where found in source
  originalDefinition: string;      // full DEFINE_UI_PARAMS line
  category?: ParameterCategory;    // auto-detected category
}

export type ParameterCategory = 
  | 'exposure'
  | 'color'
  | 'gamma' 
  | 'contrast'
  | 'saturation'
  | 'effects'
  | 'geometry'
  | 'curves'
  | 'other';

export interface ParameterParsingResult {
  parameters: ParsedDctlParameter[];
  totalFound: number;
  parseErrors: ParseError[];
  warnings: string[];
}

export interface ParseError {
  lineNumber: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ParameterGroup {
  category: ParameterCategory;
  displayName: string;
  parameters: ParsedDctlParameter[];
  isExpanded: boolean;
} 