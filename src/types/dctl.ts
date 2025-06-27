// src/types/dctl.ts

import { 
  UUID, 
  CoreParameterType, 
  ColorValue, 
  ValidationResult, 
  BaseParameterMetadata,
  BaseParameterCore 
} from './shared';

// Re-export for backward compatibility
export type ParameterType = CoreParameterType;
export type { UUID, ColorValue, ValidationResult, BaseParameterMetadata };

/**
 * Parameter definition for DCTL AST – extends shared base
 */
export interface ParameterDefinition<T extends ParameterType = ParameterType> extends BaseParameterCore {
  type: T;
  displayName?: string;
  metadata?: BaseParameterMetadata;
}

/** LUT definition placeholder */
export interface LutDefinition {
  id: UUID;
  name: string;
  format: string; // e.g. "cube", "3dl", etc.
  size: number;
}

/** Macro definition placeholder */
export interface MacroDefinition {
  id: UUID;
  name: string;
  body: string;
}

/** Function definition placeholder */
export interface FunctionDefinition {
  id: UUID;
  name: string;
  returnType?: string;
  body: string;
}

/**
 * Root AST interface representing a DCTL script in memory.
 */
export interface DctlAst {
  parameters: ParameterDefinition[];
  macros: MacroDefinition[];
  functions: FunctionDefinition[];
  luts: LutDefinition[];
} 