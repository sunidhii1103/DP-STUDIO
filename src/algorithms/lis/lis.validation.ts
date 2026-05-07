import type { LISInput, ValidationResult } from '../types';

export function validateLISInput(input: LISInput): ValidationResult {
  if (!Array.isArray(input.nums)) {
    return { isValid: false, error: 'LIS input must be an array of integers.' };
  }

  if (input.nums.length === 0) {
    return { isValid: false, error: 'Enter at least one integer for LIS.' };
  }

  if (input.nums.length > 16) {
    return { isValid: false, error: 'Use at most 16 numbers for a readable LIS visualization.' };
  }

  if (input.nums.some((value) => !Number.isInteger(value))) {
    return { isValid: false, error: 'LIS values must be integers.' };
  }

  return { isValid: true };
}
