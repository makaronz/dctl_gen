import { 
  DctlUIType, 
  ParsedDctlParameter, 
  ParameterParsingResult, 
  ParseError, 
  ParameterCategory 
} from '../types/ParsedParameter';

export class DctlParserService {
  private static readonly DEFINE_UI_PARAMS_REGEX = /DEFINE_UI_PARAMS\s*\(\s*([^)]+)\s*\)/g;
  
  /**
   * Main parsing function - extracts all parameters from DCTL content
   */
  static parseParameters(content: string): ParameterParsingResult {
    const result: ParameterParsingResult = {
      parameters: [],
      totalFound: 0,
      parseErrors: [],
      warnings: []
    };

    const lines = content.split('\n');
    let match;
    
    // Reset regex lastIndex to ensure we start from the beginning
    this.DEFINE_UI_PARAMS_REGEX.lastIndex = 0;
    
    while ((match = this.DEFINE_UI_PARAMS_REGEX.exec(content)) !== null) {
      const fullMatch = match[0];
      const parametersString = match[1];
      
      // Find line number
      const lineNumber = this.findLineNumber(content, match.index);
      
      try {
        const parameter = this.parseParameterDefinition(
          parametersString, 
          lineNumber, 
          fullMatch
        );
        
        if (parameter) {
          result.parameters.push(parameter);
          result.totalFound++;
        }
      } catch (error) {
        result.parseErrors.push({
          lineNumber,
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          severity: 'error',
          suggestion: 'Check DEFINE_UI_PARAMS syntax'
        });
      }
    }

    // Add category-based warnings
    this.addCategoryWarnings(result);
    
    return result;
  }

  /**
   * Parses a single DEFINE_UI_PARAMS definition
   */
  private static parseParameterDefinition(
    parametersString: string, 
    lineNumber: number, 
    originalDefinition: string
  ): ParsedDctlParameter | null {
    
    // Split by commas, but be careful with nested braces
    const parts = this.smartSplit(parametersString);
    
    if (parts.length < 4) {
      throw new Error(`Insufficient parameters: expected at least 4, got ${parts.length}`);
    }

    const name = parts[0].trim();
    const displayName = this.cleanString(parts[1]);
    const typeString = parts[2].trim() as DctlUIType;
    const defaultValue = this.parseValue(parts[3]);

    // Validate parameter name
    if (!this.isValidParameterName(name)) {
      throw new Error(`Invalid parameter name: ${name}`);
    }

    // Validate UI type
    if (!this.isValidUIType(typeString)) {
      throw new Error(`Invalid UI type: ${typeString}`);
    }

    const parameter: ParsedDctlParameter = {
      id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      displayName,
      type: typeString,
      defaultValue,
      currentValue: defaultValue,
      lineNumber,
      originalDefinition,
      category: this.detectCategory(name, displayName)
    };

    // Parse type-specific additional parameters
    this.parseTypeSpecificParameters(parameter, parts, typeString);

    return parameter;
  }

  /**
   * Smart comma splitting that respects braces
   */
  private static smartSplit(str: string): string[] {
    const parts: string[] = [];
    let current = '';
    let braceLevel = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const prevChar = i > 0 ? str[i - 1] : '';

      // Handle quotes
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
      }

      // Handle braces when not in quotes
      if (!inQuotes) {
        if (char === '{') {
          braceLevel++;
        } else if (char === '}') {
          braceLevel--;
        }
      }

      // Split on commas only when not in quotes or braces
      if (char === ',' && !inQuotes && braceLevel === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last part
    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  /**
   * Parses type-specific parameters (min, max, step, options)
   */
  private static parseTypeSpecificParameters(
    parameter: ParsedDctlParameter,
    parts: string[],
    type: DctlUIType
  ): void {
    switch (type) {
      case 'DCTLUI_SLIDER_FLOAT':
        if (parts.length >= 7) {
          parameter.min = this.parseValue(parts[4]) as number;
          parameter.max = this.parseValue(parts[5]) as number;
          parameter.step = this.parseValue(parts[6]) as number;
        }
        break;

      case 'DCTLUI_SLIDER_INT':
        if (parts.length >= 6) {
          parameter.min = this.parseValue(parts[4]) as number;
          parameter.max = this.parseValue(parts[5]) as number;
          parameter.step = 1; // Integer sliders always step by 1
        }
        break;

      case 'DCTLUI_COMBO_BOX':
        // Debug logging
        console.log('COMBO_BOX parsing:', {
          parameterName: parameter.name,
          partsLength: parts.length,
          parts: parts
        });
        
        if (parts.length >= 6) {
          // For COMBO_BOX: name, displayName, type, defaultValue, enumValues, enumLabels
          const enumValues = this.parseEnumValues(parts[4]);
          const enumLabels = parts.length >= 6 ? this.parseEnumValues(parts[5]) : enumValues;
          
          console.log('Parsed enum values:', { enumValues, enumLabels });
          
          parameter.options = enumValues;
          parameter.optionLabels = enumLabels;
        }
        break;

      case 'DCTLUI_CHECK_BOX':
      case 'DCTLUI_VALUE_BOX':
        // No additional parameters needed
        break;
    }
  }

  /**
   * Parses enum values from {value1, value2, value3} format
   */
  private static parseEnumValues(str: string): string[] {
    const trimmed = str.trim();
    
    // Remove outer braces
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1);
      return inner.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    
    return [];
  }

  /**
   * Parses a value (number, boolean, or string)
   */
  private static parseValue(str: string): number | boolean | string {
    const trimmed = str.trim();
    
    // Remove quotes if present
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    
    // Try to parse as number
    const num = parseFloat(trimmed);
    if (!isNaN(num)) {
      return num;
    }
    
    // Check for boolean
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    
    // Return as string
    return trimmed;
  }

  /**
   * Removes quotes and cleans string values
   */
  private static cleanString(str: string): string {
    const trimmed = str.trim();
    
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    
    return trimmed;
  }

  /**
   * Validates parameter name (must be valid C identifier)
   */
  private static isValidParameterName(name: string): boolean {
    const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return nameRegex.test(name);
  }

  /**
   * Validates UI type
   */
  private static isValidUIType(type: string): type is DctlUIType {
    const validTypes: DctlUIType[] = [
      'DCTLUI_SLIDER_FLOAT',
      'DCTLUI_SLIDER_INT',
      'DCTLUI_CHECK_BOX', 
      'DCTLUI_COMBO_BOX',
      'DCTLUI_VALUE_BOX'
    ];
    
    return validTypes.includes(type as DctlUIType);
  }

  /**
   * Auto-detects parameter category based on name and display name
   */
  private static detectCategory(name: string, displayName: string): ParameterCategory {
    const combined = `${name} ${displayName}`.toLowerCase();
    
    if (combined.includes('exposure') || combined.includes('expo')) {
      return 'exposure';
    }
    if (combined.includes('gamma') || combined.includes('gam')) {
      return 'gamma';
    }
    if (combined.includes('contrast') || combined.includes('cont')) {
      return 'contrast';
    }
    if (combined.includes('saturation') || combined.includes('sat') || combined.includes('desat')) {
      return 'saturation';
    }
    if (combined.includes('color') || combined.includes('hue') || combined.includes('tint')) {
      return 'color';
    }
    if (combined.includes('curve') || combined.includes('s-curve') || combined.includes('scurve')) {
      return 'curves';
    }
    if (combined.includes('effect') || combined.includes('fx') || combined.includes('enable') || combined.includes('invert')) {
      return 'effects';
    }
    if (combined.includes('scale') || combined.includes('size') || combined.includes('position') || combined.includes('rotation')) {
      return 'geometry';
    }
    
    return 'other';
  }

  /**
   * Finds line number for a given character index
   */
  private static findLineNumber(content: string, charIndex: number): number {
    const beforeMatch = content.substring(0, charIndex);
    return beforeMatch.split('\n').length;
  }

  /**
   * Adds category-based warnings and suggestions
   */
  private static addCategoryWarnings(result: ParameterParsingResult): void {
    const categories = result.parameters.map(p => p.category);
    
    // Warn about missing common parameters
    if (!categories.includes('exposure') && result.parameters.length > 0) {
      result.warnings.push('No exposure parameters found - consider adding exposure control');
    }
    
    if (!categories.includes('gamma') && result.parameters.length > 2) {
      result.warnings.push('No gamma parameters found - gamma correction often improves results');
    }
    
    // Warn about too many parameters
    if (result.parameters.length > 10) {
      result.warnings.push('Many parameters detected - consider grouping related controls');
    }
  }

  /**
   * Generates a user-friendly summary of parsed parameters
   */
  static generateParsingSummary(result: ParameterParsingResult): string {
    if (result.parameters.length === 0) {
      return 'No parameters found in DCTL file';
    }

    const byCategory = result.parameters.reduce((acc, param) => {
      if (!acc[param.category!]) acc[param.category!] = 0;
      acc[param.category!]++;
      return acc;
    }, {} as Record<ParameterCategory, number>);

    const categoryStrings = Object.entries(byCategory)
      .map(([category, count]) => `${count} ${category}`)
      .join(', ');

    return `Found ${result.parameters.length} parameters: ${categoryStrings}`;
  }

  /**
   * Validates the parsing result and suggests improvements
   */
  static validateParsingResult(result: ParameterParsingResult): string[] {
    const suggestions: string[] = [];

    // Check for naming patterns
    const hasNumericSuffixes = result.parameters.some(p => /\d+$/.test(p.name));
    if (hasNumericSuffixes) {
      suggestions.push('Consider grouping numerically suffixed parameters (e.g., color1, color2, color3)');
    }

    // Check parameter ranges
    const sliders = result.parameters.filter(p => 
      p.type === 'DCTLUI_SLIDER_FLOAT' || p.type === 'DCTLUI_SLIDER_INT'
    );
    
    const wideRangeSliders = sliders.filter(p => 
      p.max !== undefined && p.min !== undefined && (p.max - p.min) > 100
    );
    
    if (wideRangeSliders.length > 0) {
      suggestions.push('Some sliders have very wide ranges - consider smaller ranges for better precision');
    }

    return suggestions;
  }
} 