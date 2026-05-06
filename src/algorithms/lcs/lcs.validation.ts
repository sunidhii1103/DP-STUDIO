/* ============================================================================
 * DPVis — LCS Validation
 * ============================================================================ */

import type { LCSInput, ValidationResult } from '../types';

export function validateLCSInput(input: LCSInput): ValidationResult {
  if (!input.s1 || !input.s2) {
    return { isValid: false, error: 'Both strings must be provided' };
  }
  if (input.s1.length > 12 || input.s2.length > 12) {
    return { isValid: false, error: 'Maximum string length is 12' };
  }
  return { isValid: true };
}
