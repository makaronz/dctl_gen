import { DctlAstBuilder } from '../../../../../../src/lib/dctl/ast-builder';
import { DctlParameter } from '../../../types';
import { ParameterDefinition } from '../../../../../../src/types/dctl';
import { ColorValue, UI_TO_CORE_TYPE_MAP, UIParameterType } from '../../../../../../src/types/shared';

// Type guard to check if value is ColorValue
function isColorValue(value: any): value is ColorValue {
  return value && typeof value === 'object' && 
         typeof value.r === 'number' && 
         typeof value.g === 'number' && 
         typeof value.b === 'number';
}

function toAstParameter(p: DctlParameter): ParameterDefinition {
  const coreType = UI_TO_CORE_TYPE_MAP[p.type];
  
  if (!coreType) {
    throw new Error(`Unsupported parameter type: ${p.type}`);
  }

  return {
    id: p.id,
    name: p.name,
    type: coreType,
    displayName: p.label,
    metadata: {
      defaultValue: p.value,
      description: p.description,
      // Add range for numeric types
      ...(p.type === 'slider' && { range: [p.min, p.max] }),
      ...(p.type === 'int_slider' && { range: [p.min, p.max] })
    }
  };
}

// Helper functions for DCTL code generation
function generateParameterDeclarations(parameters: DctlParameter[]): string {
  let code = '';
  
  parameters.filter(p => p.enabled).forEach(p => {
    const paramName = p.name.replace(/[^a-zA-Z0-9_]/g, '_'); // Sanitize parameter name
    const displayLabel = p.label || p.name;
    
    const param = p as any; // Type assertion to access parameter properties
    
    switch (param.type) {
      case 'slider':
        const min = param.min || 0;
        const max = param.max || 1;
        const step = param.step || 0.01;
        code += `DEFINE_UI_PARAMS(${paramName}, ${displayLabel}, DCTLUI_SLIDER_FLOAT, ${param.value}, ${min}, ${max}, ${step})\n`;
        break;
        
      case 'int_slider':
        const intMin = param.min || 0;
        const intMax = param.max || 10;
        code += `DEFINE_UI_PARAMS(${paramName}, ${displayLabel}, DCTLUI_SLIDER_INT, ${param.value}, ${intMin}, ${intMax}, 1)\n`;
        break;
        
      case 'checkbox':
        const checkboxValue = param.value ? 1 : 0;
        code += `DEFINE_UI_PARAMS(${paramName}, ${displayLabel}, DCTLUI_CHECK_BOX, ${checkboxValue})\n`;
        break;
        
      case 'value_box':
        code += `DEFINE_UI_PARAMS(${paramName}, ${displayLabel}, DCTLUI_VALUE_BOX, ${param.value})\n`;
        break;
        
      case 'combo_box':
        if (param.options && param.optionLabels) {
          const enumValues = param.options.map((opt: string) => opt.replace(/[^a-zA-Z0-9_]/g, '_')).join(', ');
          const enumLabels = param.optionLabels.join(', ');
          code += `DEFINE_UI_PARAMS(${paramName}, ${displayLabel}, DCTLUI_COMBO_BOX, ${param.value}, {${enumValues}}, {${enumLabels}})\n`;
        } else {
          // Fallback with default options
          code += `DEFINE_UI_PARAMS(${paramName}, ${displayLabel}, DCTLUI_COMBO_BOX, ${param.value}, {opt0, opt1}, {Option 0, Option 1})\n`;
        }
        break;
        
      case 'color':
        // DCTL doesn't have native color picker, so we'll use 3 float sliders
        const color = param.value as ColorValue;
        code += `DEFINE_UI_PARAMS(${paramName}_r, ${displayLabel} Red, DCTLUI_SLIDER_FLOAT, ${color.r}, 0.0, 1.0, 0.01)\n`;
        code += `DEFINE_UI_PARAMS(${paramName}_g, ${displayLabel} Green, DCTLUI_SLIDER_FLOAT, ${color.g}, 0.0, 1.0, 0.01)\n`;
        code += `DEFINE_UI_PARAMS(${paramName}_b, ${displayLabel} Blue, DCTLUI_SLIDER_FLOAT, ${color.b}, 0.0, 1.0, 0.01)\n`;
        break;
        
      default:
        // Fallback to float slider
        code += `DEFINE_UI_PARAMS(${paramName}, ${displayLabel}, DCTLUI_SLIDER_FLOAT, ${param.value}, 0.0, 1.0, 0.01)\n`;
        break;
    }
  });
  
  return code;
}

function generateTransformationLogic(parameters: DctlParameter[]): string {
  const enabledParams = parameters.filter(p => p.enabled);
  
  if (enabledParams.length === 0) {
    return '    // No active parameters - passthrough\n    return in_rgb;';
  }

  let logic = '    float3 out_rgb = in_rgb;\n\n';
  
  // Process each parameter type with appropriate transformations
  enabledParams.forEach(param => {
    const paramType = param.type as UIParameterType;
    const paramName = param.name.replace(/[^a-zA-Z0-9_]/g, '_'); // Sanitize parameter name
    
    switch (paramType) {
      case 'slider':
        if (param.name.toLowerCase().includes('exposure')) {
          logic += `    // Exposure adjustment using ${param.name}\n`;
          logic += `    out_rgb = out_rgb * _powf(2.0f, ${paramName});\n\n`;
        } else if (param.name.toLowerCase().includes('gamma')) {
          logic += `    // Gamma correction using ${param.name}\n`;
          logic += `    out_rgb.x = _powf(_fmaxf(out_rgb.x, 0.0f), 1.0f / ${paramName});\n`;
          logic += `    out_rgb.y = _powf(_fmaxf(out_rgb.y, 0.0f), 1.0f / ${paramName});\n`;
          logic += `    out_rgb.z = _powf(_fmaxf(out_rgb.z, 0.0f), 1.0f / ${paramName});\n\n`;
        } else if (param.name.toLowerCase().includes('contrast')) {
          logic += `    // Contrast adjustment using ${param.name}\n`;
          logic += `    float3 mid = make_float3(0.18f, 0.18f, 0.18f);\n`;
          logic += `    out_rgb = mid + (out_rgb - mid) * ${paramName};\n\n`;
        } else if (param.name.toLowerCase().includes('saturation')) {
          logic += `    // Saturation adjustment using ${param.name}\n`;
          logic += `    float luma = 0.299f * out_rgb.x + 0.587f * out_rgb.y + 0.114f * out_rgb.z;\n`;
          logic += `    out_rgb = make_float3(luma, luma, luma) + (out_rgb - make_float3(luma, luma, luma)) * ${paramName};\n\n`;
        } else {
          // Generic slider - multiply
          logic += `    // Generic adjustment using ${param.name}\n`;
          logic += `    out_rgb = out_rgb * ${paramName};\n\n`;
        }
        break;
        
      case 'int_slider':
        logic += `    // Integer parameter ${param.name} (value: ${param.value})\n`;
        logic += `    if (${paramName} > 0) {\n`;
        logic += `        out_rgb = out_rgb * (1.0f + ${paramName} * 0.1f);\n`;
        logic += `    }\n\n`;
        break;
        
      case 'checkbox':
        logic += `    // Boolean toggle ${param.name}\n`;
        logic += `    if (${paramName}) {\n`;
        logic += `        // Apply effect when enabled\n`;
        logic += `        out_rgb = make_float3(1.0f, 1.0f, 1.0f) - out_rgb; // Invert\n`;
        logic += `    }\n\n`;
        break;
        
      case 'color':
        const colorParamName = param.name.replace(/[^a-zA-Z0-9_]/g, '_');
        logic += `    // Color mixer using ${param.name}\n`;
        logic += `    out_rgb.x = out_rgb.x * ${colorParamName}_r;\n`;
        logic += `    out_rgb.y = out_rgb.y * ${colorParamName}_g;\n`;
        logic += `    out_rgb.z = out_rgb.z * ${colorParamName}_b;\n\n`;
        break;
        
      case 'combo_box':
        const comboParam = param as any; // Type assertion for combo box
        logic += `    // Combo box selection ${param.name}\n`;
        logic += `    switch (${paramName}) {\n`;
        if (comboParam.options) {
          comboParam.options.forEach((option: string, index: number) => {
            logic += `        case ${index}: // ${option}\n`;
            logic += `            out_rgb = out_rgb * ${1.0 + index * 0.2}f;\n`;
            logic += `            break;\n`;
          });
        }
        logic += `        default:\n`;
        logic += `            break;\n`;
        logic += `    }\n\n`;
        break;
        
      case 'value_box':
        logic += `    // Value box ${param.name}\n`;
        logic += `    out_rgb = out_rgb + ${paramName} * 0.1f;\n\n`;
        break;
        
      default:
        logic += `    // Unsupported parameter type: ${param.type}\n\n`;
    }
  });
  
  // Add color clamping at the end
  logic += '    // Clamp output to valid range\n';
  logic += '    out_rgb.x = _fmaxf(0.0f, out_rgb.x);\n';
  logic += '    out_rgb.y = _fmaxf(0.0f, out_rgb.y);\n';
  logic += '    out_rgb.z = _fmaxf(0.0f, out_rgb.z);\n\n';
  logic += '    return out_rgb;';
  
  return logic;
}

function generateHelperFunctions(): string {
  return `
// Helper functions for color transformations

__DEVICE__ float3 rgb_to_hsv(float3 rgb) {
    float max_val = _fmaxf(_fmaxf(rgb.x, rgb.y), rgb.z);
    float min_val = _fminf(_fminf(rgb.x, rgb.y), rgb.z);
    float delta = max_val - min_val;
    
    float3 hsv;
    hsv.z = max_val; // Value
    
    if (max_val > 0.0f) {
        hsv.y = delta / max_val; // Saturation
    } else {
        hsv.y = 0.0f;
    }
    
    if (delta > 0.0f) {
        if (max_val == rgb.x) {
            hsv.x = (rgb.y - rgb.z) / delta;
        } else if (max_val == rgb.y) {
            hsv.x = 2.0f + (rgb.z - rgb.x) / delta;
        } else {
            hsv.x = 4.0f + (rgb.x - rgb.y) / delta;
        }
        hsv.x *= 60.0f;
        if (hsv.x < 0.0f) hsv.x += 360.0f;
    } else {
        hsv.x = 0.0f;
    }
    
    return hsv;
}

__DEVICE__ float3 hsv_to_rgb(float3 hsv) {
    float c = hsv.z * hsv.y;
    float h_prime = hsv.x / 60.0f;
    float x = c * (1.0f - _fabsf(_fmodf(h_prime, 2.0f) - 1.0f));
    
    float3 rgb1;
    if (h_prime >= 0.0f && h_prime < 1.0f) {
        rgb1 = make_float3(c, x, 0.0f);
    } else if (h_prime >= 1.0f && h_prime < 2.0f) {
        rgb1 = make_float3(x, c, 0.0f);
    } else if (h_prime >= 2.0f && h_prime < 3.0f) {
        rgb1 = make_float3(0.0f, c, x);
    } else if (h_prime >= 3.0f && h_prime < 4.0f) {
        rgb1 = make_float3(0.0f, x, c);
    } else if (h_prime >= 4.0f && h_prime < 5.0f) {
        rgb1 = make_float3(x, 0.0f, c);
    } else {
        rgb1 = make_float3(c, 0.0f, x);
    }
    
    float m = hsv.z - c;
    return make_float3(rgb1.x + m, rgb1.y + m, rgb1.z + m);
}

`;
}

function generateDctlCode(parameters: DctlParameter[]): string {
  const builder = new DctlAstBuilder();

  // Add parameters to the AST for validation
  parameters.filter((p: DctlParameter) => p.enabled).forEach((p: DctlParameter) => {
    builder.addParameter(toAstParameter(p));
  });

  // Generate the complete DCTL code
  let code = '// Generated by DCTL-GEN\n';
  code += '// Professional Color Transformation for DaVinci Resolve\n\n';
  
  // Add parameter declarations
  code += '// Parameter Declarations\n';
  code += generateParameterDeclarations(parameters);
  code += '\n';
  
  // Add helper functions
  code += generateHelperFunctions();
  
  // Add main transform function with real logic
  code += '__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)\n';
  code += '{\n';
  code += '    // Input color\n';
  code += '    float3 in_rgb = make_float3(p_R, p_G, p_B);\n\n';
  
  // Add transformation logic
  code += generateTransformationLogic(parameters);
  
  code += '\n}\n';

  return code;
}


self.onmessage = (event: MessageEvent<DctlParameter[]>) => {
  const parameters = event.data;
  const code = generateDctlCode(parameters);
  self.postMessage(code);
};

export {};