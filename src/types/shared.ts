// src/types/shared.ts - Shared types across all layers

// Unique identifier type
export type UUID = string;

/**
 * Color value type for DCTL parameters
 */
export interface ColorValue {
  r: number;
  g: number;
  b: number;
}

/**
 * Core parameter types supported by DCTL
 */
export type CoreParameterType = 'float' | 'int' | 'bool' | 'enum' | 'color' | 'matrix';

/**
 * UI parameter types (more specific than core types)
 */
export type UIParameterType = 'slider' | 'checkbox' | 'int_slider' | 'value_box' | 'combo_box' | 'color';

/**
 * Mapping between UI and Core parameter types
 */
export const UI_TO_CORE_TYPE_MAP: Record<UIParameterType, CoreParameterType> = {
  slider: 'float',
  value_box: 'float',
  int_slider: 'int',
  checkbox: 'bool',
  combo_box: 'enum',
  color: 'color'
};

/**
 * Base interface for all parameters - minimal shared properties
 */
export interface BaseParameterCore {
  id: UUID;
  name: string;
  type: string; // Keep generic for extensibility
}

/**
 * Generic validation result used across builder and validators
 */
export interface ValidationResult {
  errors: string[];
  warnings: string[];
  /** Convenience boolean – true when errors.length === 0 */
  isValid: boolean;
}

/**
 * Base metadata interface for parameter configuration
 */
export interface BaseParameterMetadata {
  /** Display range for editors (if numeric) */
  range?: [number, number];
  /** Default numeric precision */
  precision?: number;
  /** Default value before user modification */
  defaultValue?: number | string | boolean | ColorValue;
  /** Category/group used in UI */
  category?: string;
  /** Human-readable display name */
  displayName?: string;
  /** Optional description for documentation */
  description?: string;
} 