export interface DctlFile {
  id: string;
  name: string;
  size: number;
  content: string;
  uploadedAt: Date;
  isValid: boolean;
  errorMessage?: string;
  parametersCount: number;
}

export interface DctlFileContent {
  parameters: string;
  helperFunctions: string;
  transformFunction: string;
  fullContent: string;
}

export interface DctlFileValidation {
  isValid: boolean;
  hasTransformFunction: boolean;
  hasParameters: boolean;
  syntaxErrors: string[];
  warnings: string[];
}

export interface LoadedFile {
  file: DctlFile;
  content: DctlFileContent;
  validation: DctlFileValidation;
  isSelected: boolean;
}

export type DctlFileStatus = 'loading' | 'loaded' | 'error' | 'parsing'; 