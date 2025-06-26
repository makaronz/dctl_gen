import {
  DctlAst,
  ParameterDefinition,
  MacroDefinition,
  FunctionDefinition,
  LutDefinition,
  ValidationResult
} from '../../types/dctl';
import { validateAst } from '../validation/ast-validation';

/**
 * Builder class responsible for constructing and validating a DCTL AST.
 */
export class DctlAstBuilder {
  private ast: DctlAst;

  constructor() {
    this.ast = {
      parameters: [],
      macros: [],
      functions: [],
      luts: []
    };
  }

  /** Return immutable snapshot of current AST */
  getAst(): Readonly<DctlAst> {
    return JSON.parse(JSON.stringify(this.ast));
  }

  /** Parameter helpers */
  addParameter(param: ParameterDefinition): void {
    this.ensureUniqueId(param.id, 'parameter');
    this.ast.parameters.push(param);
  }

  addMacro(macro: MacroDefinition): void {
    this.ensureUniqueId(macro.id, 'macro');
    this.ast.macros.push(macro);
  }

  addFunction(func: FunctionDefinition): void {
    this.ensureUniqueId(func.id, 'function');
    this.ast.functions.push(func);
  }

  addLut(lut: LutDefinition): void {
    this.ensureUniqueId(lut.id, 'lut');
    this.ast.luts.push(lut);
  }

  /**
   * Validate internal AST and return result.
   */
  validate(): ValidationResult {
    return validateAst(this.ast);
  }

  /** Serialize AST to plain JSON object */
  toJSON(): DctlAst {
    return this.getAst();
  }

  /** Serialize AST to string */
  toJSONString(space = 2): string {
    return JSON.stringify(this.ast, null, space);
  }

  /** Static helper to build from JSON */
  static fromJSON(obj: DctlAst): DctlAstBuilder {
    const builder = new DctlAstBuilder();
    builder.ast = JSON.parse(JSON.stringify(obj));
    return builder;
  }

  // -------------------- private helpers --------------------

  private ensureUniqueId(id: string, type: string): void {
    const duplicate = [
      ...this.ast.parameters,
      ...this.ast.macros,
      ...this.ast.functions,
      ...this.ast.luts
    ].some((n: any) => n.id === id);

    if (duplicate) {
      throw new Error(`Duplicate ${type} id detected: ${id}`);
    }
  }
} 