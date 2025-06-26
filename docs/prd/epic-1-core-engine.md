# Epic 1: Core Engine - DCTL Builder Foundation

## Epic Goal

Build the core DCTL Builder Engine that transforms parameter configurations and macro definitions into optimized DCTL code through AST construction and code generation pipeline.

## Epic Description

**System Foundation:**
The Core Engine is the heart of the DCTL Generator application. It transforms user-defined parameters, LUTs, and macro configurations into valid, optimized DCTL code. This epic establishes the fundamental code generation pipeline that all other features depend on.

**Key Components:**
- TypeScript AST Builder for DCTL syntax
- Code generation with optimization strategies  
- Validation framework with static analysis
- Parameter-to-code transformation engine
- Macro expansion and dependency resolution

**Technical Foundation:**
- React 18.2.0+ with TypeScript 5.3.0+ (strict mode)
- Custom AST builder with Zod validation
- Prettier integration for DCTL formatting
- Web Worker for non-blocking code generation

## Stories

### 1.1: AST Builder Foundation
**Goal:** Create the core AST builder that can represent DCTL syntax as TypeScript objects
**Requirements:**
- DctlAstBuilder class with parameter/macro/function support
- AST node types for all DCTL constructs (parameters, transforms, functions)
- Basic validation for AST structure integrity
- TypeScript interfaces matching PRD specifications

### 1.2: Code Generation Pipeline  
**Goal:** Transform AST into valid DCTL code with proper formatting
**Requirements:**
- Emit functionality that converts AST to DCTL string
- Support for DCTL version 1 and 2 target formats
- Integration with Prettier for consistent code formatting
- Basic optimization passes (constant folding, dead code elimination)

### 1.3: Parameter Integration System
**Goal:** Connect parameter definitions to AST and code generation
**Requirements:**
- Parameter-to-AST transformation logic
- Support for float, int, bool, enum, color parameter types
- Range validation and default value handling
- UI binding preparation for parameter controls

### 1.4: Validation Framework
**Goal:** Implement static analysis and validation rules for generated DCTL
**Requirements:**  
- ValidationRule interface with configurable severity levels
- Core validation rules (naming conventions, range consistency, precision)
- Error reporting with line numbers and fix suggestions
- Performance analysis for GPU compatibility

### 1.5: Optimization Engine
**Goal:** Implement code optimization strategies for performance
**Requirements:**
- Dead code elimination for unused parameters/functions
- Loop unrolling for fixed-size iterations  
- Memory access pattern optimization for GPU cache
- Vectorization hints for SIMD compatibility

## Technical Requirements

**From Architecture [Source: 2-technical-requirements.md#221-dctl-builder-engine]:**
```typescript
interface DctlBuilderConfig {
  version: 1 | 2;
  targetResolveVersion: number; // e.g., 18000 for v18
  optimizationLevel: 'none' | 'basic' | 'aggressive';
  syntaxValidation: 'strict' | 'permissive';
  memoryAlignment: boolean;
}

interface BuilderCapabilities {
  parameterTypes: ['float', 'int', 'bool', 'enum', 'color'];
  lutFormats: ['cube', '3dl', 'inline', 'csp'];
  macroSupport: ['conditional', 'iterative', 'recursive'];
  mathPrecision: ['fp16', 'fp32', 'fp64'];
}
```

**From Architecture [Source: 2-technical-requirements.md#241-ast-construction]:**
```typescript
class DctlAstBuilder {
  private ast: DctlAst;
  
  addParameter(param: ParameterDefinition): void;
  addMacro(macro: MacroDefinition): void;
  addFunction(func: FunctionDefinition): void;
  addLut(lut: LutDefinition): void;
  
  optimize(level: OptimizationLevel): void;
  validate(): ValidationResult[];
  emit(format: EmitFormat): string;
}
```

## Acceptance Criteria

### Epic-Level ACs:
1. **AC1:** AST Builder can represent complete DCTL programs as TypeScript objects
2. **AC2:** Code generator produces valid DCTL v1 and v2 syntax
3. **AC3:** Parameter definitions automatically generate corresponding DCTL parameter declarations
4. **AC4:** Validation framework catches syntax errors and GPU compatibility issues
5. **AC5:** Optimization engine produces measurably faster DCTL code
6. **AC6:** Generated code follows DaVinci Resolve naming conventions and memory alignment requirements

### Performance Requirements:
- Code generation completes in <100ms for typical configurations (10-20 parameters)
- AST construction supports up to 100 parameters without performance degradation
- Validation runs incrementally with <16ms response time for UI feedback

### Compatibility Requirements:
- Supports DaVinci Resolve v18+ target format
- Generated DCTL compatible with fp16, fp32, fp64 precision modes
- Memory alignment follows 16-byte boundaries for GPU optimization

## Dependencies

**Prerequisites:**
- None (this is the foundation epic)

**Provides Foundation For:**
- Epic 2: Parameter System (requires AST parameter integration)
- Epic 3: LUT Processing (requires AST LUT definitions) 
- Epic 4: User Interface (requires code generation for preview)
- Epic 5: Data Management (requires AST serialization)

## Risk Mitigation

**Primary Risk:** DCTL syntax complexity and version compatibility
**Mitigation:** Extensive testing with real DaVinci Resolve projects and reference DCTL examples

**Secondary Risk:** Performance degradation with large parameter sets
**Mitigation:** Web Worker implementation and incremental compilation strategies

## Definition of Done

- [ ] All 5 stories completed with acceptance criteria met
- [ ] AST can represent complete DCTL programs
- [ ] Code generation produces valid, formatted DCTL output
- [ ] Parameter integration works for all supported types
- [ ] Validation framework catches critical errors
- [ ] Optimization engine demonstrates measurable improvements
- [ ] Performance benchmarks meet specified requirements
- [ ] Documentation covers API usage and examples 