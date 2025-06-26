// dctl-generator.worker.ts
import { DctlParameter } from "@/features/dctl-generator/store";

function generateDctlCode(parameters: DctlParameter[]): string {
  if (parameters.length === 0) {
    return "// Add components to generate DCTL code.";
  }

  const defineUiParams = parameters.map(param => {
    // This is a simplified generator. More logic will be needed for real attributes.
    return `  ${param.name}, "${param.name}", DCTLUI_SLIDER_FLOAT, 0.5, 0.0, 1.0, 0.01`;
  }).join(',\n');

  return `DEFINE_UI_PARAMS(
${defineUiParams}
)

__DEVICE__ float3 main(int p_Width, int p_Height, int p_X, int p_Y, float3 p_R, float3 p_G, float3 p_B)
{
  // Your generated code will appear here...
  return p_R;
}`;
}


self.onmessage = (event: MessageEvent<DctlParameter[]>) => {
  const parameters = event.data;
  const code = generateDctlCode(parameters);
  self.postMessage(code);
}; 