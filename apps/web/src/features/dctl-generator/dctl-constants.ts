export interface DctlFunction {
  name: string;
  label: string;
  description: string;
  category: 'Math' | 'Vector' | 'Color' | 'Input';
}

export const DCTL_FUNCTIONS: DctlFunction[] = [
  // Math
  { name: '_powf', label: 'Power', description: 'base to the power of exponent', category: 'Math' },
  { name: '_logf', label: 'Logarithm', description: 'Natural logarithm', category: 'Math' },
  { name: '_expf', label: 'Exponent', description: 'e to the power of x', category: 'Math' },
  { name: '_sqrtf', label: 'Square Root', description: 'Square root of a number', category: 'Math' },
  { name: '_sinf', label: 'Sine', description: 'Sine of an angle', category: 'Math' },
  { name: '_cosf', label: 'Cosine', description: 'Cosine of an angle', category: 'Math' },
  { name: '_tanf', label: 'Tangent', description: 'Tangent of an angle', category: 'Math' },
  { name: '_asinf', label: 'Arc Sine', description: 'Arc sine of a value', category: 'Math' },
  { name: '_acosf', label: 'Arc Cosine', description: 'Arc cosine of a value', category: 'Math' },
  { name: '_atanf', label: 'Arc Tangent', description: 'Arc tangent of a value', category: 'Math' },
  { name: '_atan2f', label: 'Arc Tangent 2', description: 'Arc tangent of y/x', category: 'Math' },
  { name: '_fabsf', label: 'Absolute Value', description: 'Absolute value of a float', category: 'Math' },
  { name: '_floorf', label: 'Floor', description: 'Largest integer not greater than x', category: 'Math' },
  { name: '_ceilf', label: 'Ceiling', description: 'Smallest integer not less than x', category: 'Math' },
  { name: '_fmodf', label: 'Modulo', description: 'Floating-point remainder of x/y', category: 'Math' },

  // Vector
  { name: 'min', label: 'Min', description: 'Minimum of two values', category: 'Vector' },
  { name: 'max', label: 'Max', description: 'Maximum of two values', category: 'Vector' },
  { name: 'clamp', label: 'Clamp', description: 'Clamp a value between a range', category: 'Vector' },
  { name: 'lerp', label: 'Lerp', description: 'Linear interpolation', category: 'Vector' },
  { name: 'smoothstep', label: 'Smoothstep', description: 'Smooth Hermite interpolation', category: 'Vector' },

  // Color
  { name: 'rgb_to_hsv', label: 'RGB to HSV', description: 'Convert RGB to HSV color space', category: 'Color' },
  { name: 'hsv_to_rgb', label: 'HSV to RGB', description: 'Convert HSV to RGB color space', category: 'Color' },
  { name: 'rgb_to_xyz', label: 'RGB to XYZ', description: 'Convert RGB to XYZ color space', category: 'Color' },
  { name: 'xyz_to_rgb', label: 'XYZ to RGB', description: 'Convert XYZ to RGB color space', category: 'Color' },
  { name: 'xyz_to_lab', label: 'XYZ to LAB', description: 'Convert XYZ to LAB color space', category: 'Color' },
  { name: 'lab_to_xyz', label: 'LAB to XYZ', description: 'Convert LAB to XYZ color space', category: 'Color' },

  // Input
  { name: 'p_Width', label: 'Pixel Width', description: 'Input image width', category: 'Input' },
  { name: 'p_Height', label: 'Pixel Height', description: 'Input image height', category: 'Input' },
  { name: 'p_X', label: 'Pixel X', description: 'Current pixel X coordinate', category: 'Input' },
  { name: 'p_Y', label: 'Pixel Y', description: 'Current pixel Y coordinate', category: 'Input' },
  { name: 'p_R', label: 'Input Red', description: 'Input red channel value', category: 'Input' },
  { name: 'p_G', label: 'Input Green', description: 'Input green channel value', category: 'Input' },
  { name: 'p_B', label: 'Input Blue', description: 'Input blue channel value', category: 'Input' },
]; 