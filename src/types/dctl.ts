// src/types/dctl.ts

// Unique identifier type
export type UUID = string;

// Supported parameter types
export type ParameterType = 'float' | 'int' | 'bool' | 'enum' | 'color' | 'matrix';

/**
 * Generic validation result used across builder and validators.
 */
export interface ValidationResult {
  errors: string[];
  warnings: string[];
  /** Convenience boolean – true when errors.length === 0 */
  isValid: boolean;
}

/**
 * Minimal metadata for parameters – will be extended in future stories.
 */
export interface BaseParameterMetadata {
  /** Display range for editors (if numeric) */
  range?: [number, number];
  /** Default numeric precision */
  precision?: number;
  /** Default value before user modification */
  defaultValue?: number | string | boolean;
}

/**
 * Parameter definition – simplified for Story 1.1 needs.
 */
export interface ParameterDefinition<T extends ParameterType = ParameterType> {
  id: UUID;
  type: T;
  name: string;
  displayName?: string;
  /** Category/group used in UI */
  category?: string;
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