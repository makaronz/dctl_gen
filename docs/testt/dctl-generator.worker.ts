import { DctlParameter } from "@/features/dctl-generator/store";

function generateDctlCode(parameters: DctlParameter[]): string {
  if (parameters.length === 0) {
    return "// Add components to generate DCTL code.";
  }

  const defineUiParams = parameters.map(param => {
    return `  ${param.name}, "${param.name}", DCTLUI_SLIDER_FLOAT, 0.5, 0.0, 1.0, 0.01`;
  }).join(',\\n');

  return `DEFINE_UI_PARAMS(\\n${defineUiParams}\\n);\\n\\n__DEVICE__ float3 main(int p_Width, int p_Height, int p_X, int p_Y, float3 p_R, float3 p_G, float3 p_B)\\n{\\n  // Your generated code will appear here...\\n  return p_R;\\n}`;
}


self.onmessage = (event: MessageEvent<DctlParameter[]>) => {
  const parameters = event.data;
  const code = generateDctlCode(parameters);
  self.postMessage(code);
};

export {}; 