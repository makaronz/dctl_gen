import { DctlFile, DctlFileContent, DctlFileValidation, LoadedFile } from '../types/DctlFile';

export class DctlFileService {
  private static readonly DCTL_EXTENSION = '.dctl';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  /**
   * Validates if uploaded file is a valid DCTL file
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(this.DCTL_EXTENSION)) {
      return { 
        isValid: false, 
        error: `File must have ${this.DCTL_EXTENSION} extension` 
      };
    }
    
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB` 
      };
    }
    
    // Check if file is empty
    if (file.size === 0) {
      return { 
        isValid: false, 
        error: 'File cannot be empty' 
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Reads file content as text
   */
  static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content || '');
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file content'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Creates a DctlFile object from uploaded file
   */
  static async createDctlFile(file: File): Promise<DctlFile> {
    const validation = this.validateFile(file);
    
    if (!validation.isValid) {
      return {
        id: this.generateFileId(),
        name: file.name,
        size: file.size,
        content: '',
        uploadedAt: new Date(),
        isValid: false,
        errorMessage: validation.error,
        parametersCount: 0
      };
    }
    
    try {
      const content = await this.readFileContent(file);
      const contentValidation = this.validateDctlContent(content);
      
      return {
        id: this.generateFileId(),
        name: file.name,
        size: file.size,
        content,
        uploadedAt: new Date(),
        isValid: contentValidation.isValid,
        errorMessage: contentValidation.isValid ? undefined : contentValidation.syntaxErrors.join('; '),
        parametersCount: this.countParameters(content)
      };
    } catch (error) {
      return {
        id: this.generateFileId(),
        name: file.name,
        size: file.size,
        content: '',
        uploadedAt: new Date(),
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error reading file',
        parametersCount: 0
      };
    }
  }
  
  /**
   * Validates DCTL file content structure
   */
  static validateDctlContent(content: string): DctlFileValidation {
    const validation: DctlFileValidation = {
      isValid: true,
      hasTransformFunction: false,
      hasParameters: false,
      syntaxErrors: [],
      warnings: []
    };
    
    // Check for transform function
    const transformRegex = /__DEVICE__\s+float3\s+transform\s*\([^)]+\)/;
    validation.hasTransformFunction = transformRegex.test(content);
    
    if (!validation.hasTransformFunction) {
      validation.syntaxErrors.push('Missing __DEVICE__ float3 transform function');
      validation.isValid = false;
    }
    
    // Check for parameters
    const parametersRegex = /DEFINE_UI_PARAMS\s*\([^)]+\)/g;
    const parametersFound = content.match(parametersRegex);
    validation.hasParameters = !!parametersFound && parametersFound.length > 0;
    
    if (!validation.hasParameters) {
      validation.warnings.push('No DEFINE_UI_PARAMS found - this DCTL has no user controls');
    }
    
    // Check for common syntax issues
    this.checkCommonSyntaxIssues(content, validation);
    
    return validation;
  }
  
  /**
   * Parses DCTL content into structured sections
   */
  static parseDctlContent(content: string): DctlFileContent {
    const lines = content.split('\n');
    
    let parameters = '';
    let helperFunctions = '';
    let transformFunction = '';
    let inTransformFunction = false;
    let braceCount = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Extract DEFINE_UI_PARAMS
      if (trimmedLine.startsWith('DEFINE_UI_PARAMS')) {
        parameters += line + '\n';
        continue;
      }
      
      // Detect start of transform function
      if (trimmedLine.includes('__DEVICE__') && trimmedLine.includes('transform')) {
        inTransformFunction = true;
        transformFunction += line + '\n';
        braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        continue;
      }
      
      // Handle transform function content
      if (inTransformFunction) {
        transformFunction += line + '\n';
        braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        
        if (braceCount <= 0) {
          inTransformFunction = false;
        }
        continue;
      }
      
      // Everything else goes to helper functions
      if (trimmedLine.length > 0 && !trimmedLine.startsWith('//')) {
        helperFunctions += line + '\n';
      }
    }
    
    return {
      parameters: parameters.trim(),
      helperFunctions: helperFunctions.trim(),
      transformFunction: transformFunction.trim(),
      fullContent: content
    };
  }
  
  /**
   * Counts DEFINE_UI_PARAMS in content
   */
  static countParameters(content: string): number {
    const matches = content.match(/DEFINE_UI_PARAMS\s*\([^)]+\)/g);
    return matches ? matches.length : 0;
  }
  
  /**
   * Checks for common DCTL syntax issues
   */
  private static checkCommonSyntaxIssues(content: string, validation: DctlFileValidation): void {
    // Check for missing semicolons (basic check)
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length > 0 && 
          !trimmed.startsWith('//') && 
          !trimmed.startsWith('#') &&
          !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') &&
          !trimmed.includes('DEFINE_UI_PARAMS')) {
        validation.warnings.push(`Line ${index + 1}: Missing semicolon?`);
      }
    });
    
    // Check for undefined functions (basic check)
    const undefinedFunctions = ['max(', 'min(', 'abs(', 'sqrt(', 'pow('];
    undefinedFunctions.forEach(func => {
      if (content.includes(func)) {
        validation.warnings.push(`Found '${func}' - should use DCTL equivalent like '_fmaxf(', '_fminf(', etc.`);
      }
    });
  }
  
  /**
   * Generates unique file ID
   */
  static generateFileId(): string {
    return `dctl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Creates a LoadedFile object
   */
  static createLoadedFile(dctlFile: DctlFile): LoadedFile {
    const content = this.parseDctlContent(dctlFile.content);
    const validation = this.validateDctlContent(dctlFile.content);
    
    return {
      file: dctlFile,
      content,
      validation,
      isSelected: false
    };
  }
} 