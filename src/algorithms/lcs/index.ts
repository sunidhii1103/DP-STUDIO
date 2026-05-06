/* ============================================================================
 * DPVis — LCS Algorithm Export
 * ============================================================================ */

import { LCSTabulation } from './lcs.tabulation';
import { LCSMemoization } from './lcs.memoization';

export const lcsApproaches = {
  tabulation: new LCSTabulation(),
  memoization: new LCSMemoization(),
};
