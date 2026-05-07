import type { ApproachModuleMap } from '../types';
import { MCMTabulation } from './mcm.tabulation';

export const mcmApproaches: ApproachModuleMap = {
  tabulation: new MCMTabulation(),
};
