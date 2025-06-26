# 4. Core Engine Architecture

## 4.1 DCTL Builder Engine

```typescript
class DctlBuilderEngine {
  private config: DctlBuilderConfig;
  private ast: DctlAst;
  private validator: ValidationEngine;
  private optimizer: CodeOptimizer;
  
  constructor(config: DctlBuilderConfig) {
    this.config = config;
    this.ast = new DctlAst();
    this.validator = new ValidationEngine(config);
    this.optimizer = new CodeOptimizer(config);
  }
  
  // Public API
  async buildFromProject(project: DctlProject): Promise<BuildResult> {
    try {
      // 1. Build AST from project
      this.buildAst(project);
      
      // 2. Validate AST
      const validationResult = await this.validator.validate(this.ast);
      if (validationResult.hasErrors) {
        throw new ValidationError(validationResult.errors);
      }
      
      // 3. Optimize AST
      if (this.config.optimizationLevel !== 'none') {
        this.ast = await this.optimizer.optimize(this.ast);
      }
      
      // 4. Generate code
      const code = this.generateCode();
      
      return {
        code,
        warnings: validationResult.warnings,
        metadata: this.generateMetadata()
      };
    } catch (error) {
      return {
        code: '',
        errors: [error],
        warnings: [],
        metadata: null
      };
    }
  }
  
  private buildAst(project: DctlProject): void {
    // Build header
    this.ast.addHeader(project.metadata.title);
    this.ast.addVersionPragma(project.config.dctlVersion);
    
    // Add parameters
    project.parameters.forEach(param => {
      this.ast.addParameter(this.convertParameter(param));
    });
    
    // Add LUTs
    project.luts.forEach(lut => {
      this.ast.addLut(this.convertLut(lut));
    });
    
    // Add custom macros
    project.macros.forEach(macro => {
      this.ast.addMacro(this.convertMacro(macro));
    });
    
    // Build transform function
    this.ast.addTransformFunction(
      this.buildTransformFunction(project)
    );
  }
  
  private generateCode(): string {
    const sections: string[] = [];
    
    // Header comments
    sections.push(this.ast.generateHeader());
    
    // Version pragma
    sections.push(this.ast.generateVersionPragma());
    
    // Includes
    sections.push(this.ast.generateIncludes());
    
    // Parameter definitions
    sections.push(this.ast.generateParameters());
    
    // LUT definitions
    sections.push(this.ast.generateLuts());
    
    // Custom macros
    sections.push(this.ast.generateMacros());
    
    // Transform function
    sections.push(this.ast.generateTransformFunction());
    
    return sections.filter(Boolean).join('\n\n');
  }
}
```

## 4.2 Parameter System Architecture

```typescript
// Parameter type system
type ParameterType = 'float' | 'int' | 'bool' | 'enum' | 'color' | 'matrix';

interface ParameterDefinition<T extends ParameterType = ParameterType> {
  id: UUID;
  type: T;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  metadata: ParameterMetadata<T>;
  validation: ValidationSchema<T>;
  uiConfig: UIComponentConfig<T>;
  codeGeneration: CodeGenerationConfig<T>;
}

// Type-specific metadata
type ParameterMetadata<T> = 
  T extends 'float' ? FloatMetadata :
  T extends 'int' ? IntMetadata :
  T extends 'bool' ? BoolMetadata :
  T extends 'enum' ? EnumMetadata :
  T extends 'color' ? ColorMetadata :
  T extends 'matrix' ? MatrixMetadata :
  never;

interface FloatMetadata {
  range: [min: number, max: number];
  softRange?: [softMin: number, softMax: number];
  step: number;
  precision: number;
  defaultValue: number;
  unit?: 'percent' | 'degrees' | 'stops' | 'kelvin' | 'custom';
  curve?: 'linear' | 'logarithmic' | 'exponential' | 'bezier';
  curveParams?: number[];
}

interface EnumMetadata {
  options: Array<{
    value: number | string;
    label: string;
    description?: string;
    icon?: string;
  }>;
  defaultValue: number | string;
  allowMultiple?: boolean;
  searchable?: boolean;
}

// Parameter factory
class ParameterFactory {
  static createFloat(config: Partial<FloatMetadata>): ParameterDefinition<'float'> {
    return {
      id: generateUUID(),
      type: 'float',
      name: config.name || 'floatParam',
      displayName: config.displayName || 'Float Parameter',
      category: 'general',
      metadata: {
        range: config.range || [0, 1],
        step: config.step || 0.01,
        precision: config.precision || 2,
        defaultValue: config.defaultValue || 0,
        unit: config.unit || 'custom',
        curve: config.curve || 'linear',
        ...config
      },
      validation: new FloatValidationSchema(config),
      uiConfig: new FloatUIConfig(config),
      codeGeneration: new FloatCodeGen(config)
    };
  }
  
  // Similar factories for other parameter types...
}
```

## 4.3 LUT Processing Pipeline

```typescript
interface LutProcessor {
  // Core processing methods
  parse(input: ArrayBuffer, format: LutFormat): Promise<LutData>;
  validate(lut: LutData): ValidationResult;
  optimize(lut: LutData, options: OptimizationOptions): OptimizedLut;
  serialize(lut: OptimizedLut, format: 'inline' | 'external'): string;
  
  // Analysis methods
  analyze(lut: LutData): LutAnalysis;
  generateThumbnail(lut: LutData): Promise<ImageData>;
  calculateStats(lut: LutData): LutStatistics;
}

class LutProcessorImpl implements LutProcessor {
  private parsers: Map<LutFormat, LutParser>;
  private validators: ValidationRule[];
  private optimizers: Map<string, LutOptimizer>;
  
  constructor() {
    this.initializeParsers();
    this.initializeValidators();
    this.initializeOptimizers();
  }
  
  async parse(input: ArrayBuffer, format: LutFormat): Promise<LutData> {
    const parser = this.parsers.get(format);
    if (!parser) {
      throw new Error(`Unsupported LUT format: ${format}`);
    }
    
    const rawData = await parser.parse(input);
    return this.normalizeLutData(rawData);
  }
  
  validate(lut: LutData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Size validation
    if (!this.isValidSize(lut.size)) {
      errors.push(new ValidationError('Invalid LUT size', lut.size));
    }
    
    // Data integrity validation
    if (!this.validateDataIntegrity(lut.data)) {
      errors.push(new ValidationError('Corrupted LUT data'));
    }
    
    // Performance warnings
    if (lut.size > 64) {
      warnings.push(new ValidationWarning('Large LUT may impact performance'));
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  }
  
  optimize(lut: LutData, options: OptimizationOptions): OptimizedLut {
    let optimized = { ...lut };
    
    // Apply optimizations based on options
    if (options.reduceSize && lut.size > 33) {
      optimized = this.reduceLutSize(optimized, 33);
    }
    
    if (options.removeRedundancy) {
      optimized = this.removeRedundantEntries(optimized);
    }
    
    if (options.quantize) {
      optimized = this.quantizeValues(optimized, options.quantizeBits || 16);
    }
    
    return {
      ...optimized,
      originalSize: lut.data.length,
      compressionRatio: optimized.data.length / lut.data.length,
      optimizations: options
    };
  }
}
```

---
