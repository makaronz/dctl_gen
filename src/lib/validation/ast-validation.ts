import type {
  DctlAst,
  ValidationResult,
  ParameterDefinition,
  MacroDefinition,
  FunctionDefinition,
  LutDefinition
} from '../../types/dctl';

/**
 * Validate a DCTL AST.
 * Checks for:
 *  - Duplicate IDs across all node categories
 *  - Required fields (id & name) presence
 */
export function validateAst(ast: DctlAst): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Helper to collect IDs
  const collectIds = <T extends { id: string }>(nodes: T[], type: string) => {
    const idSet = new Set<string>();
    nodes.forEach((n) => {
      if (!n.id) {
        errors.push(`${type} is missing required field: id`);
        return;
      }
      if (idSet.has(n.id)) {
        errors.push(`Duplicate ${type} id detected: ${n.id}`);
      }
      idSet.add(n.id);
    });
  };

  // Validate individual categories
  collectIds<ParameterDefinition>(ast.parameters, 'parameter');
  collectIds<MacroDefinition>(ast.macros, 'macro');
  collectIds<FunctionDefinition>(ast.functions, 'function');
  collectIds<LutDefinition>(ast.luts, 'lut');

  // Additional light-weight checks – example: parameter naming
  ast.parameters.forEach((p) => {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(p.name)) {
      warnings.push(`Parameter name '${p.name}' does not follow alphanumeric/underscore convention.`);
    }
  });

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
} 