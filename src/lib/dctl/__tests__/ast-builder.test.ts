// @ts-nocheck
// src/lib/dctl/__tests__/ast-builder.test.ts

import { describe, it, expect } from '@jest/globals';
import { DctlAstBuilder } from '../../dctl/ast-builder';

describe('DctlAstBuilder', () => {
  it('should add parameters, macros, functions, and LUTs without errors', () => {
    const builder = new DctlAstBuilder();

    builder.addParameter({
      id: 'param-1',
      type: 'float',
      name: 'exposure'
    });

    builder.addMacro({
      id: 'macro-1',
      name: 'MIX',
      body: 'return a * (1 - t) + b * t;'
    });

    builder.addFunction({
      id: 'func-1',
      name: 'toLinear',
      body: 'return pow(c, 2.2);'
    });

    builder.addLut({
      id: 'lut-1',
      name: 'Film',
      format: 'cube',
      size: 33
    });

    const validation = builder.validate();
    expect(validation.isValid).toBe(true);
  });

  it('should throw error on duplicate ids', () => {
    const builder = new DctlAstBuilder();
    const id = 'duplicate-id';

    builder.addParameter({ id, type: 'float', name: 'gain' });
    expect(() =>
      builder.addMacro({ id, name: 'DUP', body: '' })
    ).toThrow(/Duplicate/);
  });

  it('should serialize and deserialize correctly', () => {
    const builder = new DctlAstBuilder();
    builder.addParameter({ id: 'id-123', type: 'bool', name: 'bypass' });

    const json = builder.toJSON();
    const restored = DctlAstBuilder.fromJSON(json);
    expect(restored.validate().isValid).toBe(true);
    expect(restored.getAst().parameters.length).toBe(1);
  });
}); 