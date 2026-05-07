import type { MCMInput, ValidationResult } from '../types';

export function validateMCMInput(input: MCMInput): ValidationResult {
  if (!input || !Array.isArray(input.dimensions)) {
    return { isValid: false, error: 'Enter matrix dimensions as comma-separated positive integers.' };
  }

  if (input.dimensions.length < 3) {
    return { isValid: false, error: 'Matrix Chain Multiplication needs at least 2 matrices, so provide at least 3 dimensions.' };
  }

  const invalid = input.dimensions.find(value => !Number.isInteger(value) || value <= 0);
  if (invalid !== undefined) {
    return { isValid: false, error: 'All dimensions must be positive integers.' };
  }

  if (input.dimensions.length > 9) {
    return { isValid: false, error: 'Use at most 8 matrices so the visualization stays readable.' };
  }

  return { isValid: true };
}
