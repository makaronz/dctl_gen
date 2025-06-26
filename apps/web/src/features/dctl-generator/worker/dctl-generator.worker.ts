import { DctlParameter, SliderParameter, CheckboxParameter } from '@/types';

// Constants for LogC decoding (EI 800)
const cut = 0.010591;
const a = 5.555556;
const b = 0.052272;
const c = 0.247190;
const d = 0.385537;
const e = 5.367655;
const f = 0.092809;
const e_cut_f = e * cut + f; // Pre-calculate for efficiency

// LogC to Linear decoding function
const logC_to_linear = `
__DEVICE__ float logC_to_linear(float x) {
    return (x > ${e_cut_f}) ? (_powf(10.0f, (x - ${d}) / ${c}) - ${b}) / ${a} : (x - ${f}) / ${e};
}`;

// Rec.709 encoding function
const linear_to_rec709 = `
__DEVICE__ float linear_to_rec709(float x) {
    if (x < 0.018f) {
        return x * 4.5f;
    } else {
        return 1.099f * _powf(x, 0.45f) - 0.099f;
    }
}`;

// AWG to Rec.709 Matrix
const awg_to_rec709_matrix = `
    const float3x3 awg_to_rec709 = {
        { 1.617523f, -0.537287f, -0.080237f },
        { -0.070573f,  1.334613f, -0.264040f },
        { -0.021102f, -0.226954f,  1.248056f }
    };`;

function generateLogCToRec709() {
    return `
${logC_to_linear}

${linear_to_rec709}

__DEVICE__ float3 transform(int p_Width, int p_Height, int p_X, int p_Y, float p_R, float p_G, float p_B)
{
    // Create input vector
    float3 in_rgb = make_float3(p_R, p_G, p_B);

    // Decode LogC to linear
    float3 linear_rgb;
    linear_rgb.x = logC_to_linear(in_rgb.x);
    linear_rgb.y = logC_to_linear(in_rgb.y);
    linear_rgb.z = logC_to_linear(in_rgb.z);

    // Define AWG to Rec.709 matrix
${awg_to_rec709_matrix}

    // Apply matrix
    float3 rec709_linear_rgb = mul(awg_to_rec709, linear_rgb);

    // Encode to Rec.709 gamma
    float3 final_rgb;
    final_rgb.x = linear_to_rec709(rec709_linear_rgb.x);
    final_rgb.y = linear_to_rec709(rec709_linear_rgb.y);
    final_rgb.z = linear_to_rec709(rec709_linear_rgb.z);

    return final_rgb;
}
`;
}

self.onmessage = (event: MessageEvent<any>) => {
  // We ignore parameters for now and just generate the static transform
  const code = generateLogCToRec709();
  self.postMessage(code);
};

export {}; 