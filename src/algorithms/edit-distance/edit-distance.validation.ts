import type { AlgorithmInput, EditDistanceInput, ValidationResult } from '../../types/algorithm.types';

export function validateEditDistanceInput(input: AlgorithmInput): ValidationResult {
  const { s1, s2 } = input as EditDistanceInput;

  if (typeof s1 !== 'string' || typeof s2 !== 'string') {
    return { isValid: false, error: 'Both inputs must be strings.' };
  }

  if (s1.length > 12 || s2.length > 12) {
    return { isValid: false, error: 'String length cannot exceed 12 characters to ensure stable visualization.' };
  }

  return { isValid: true };
}
