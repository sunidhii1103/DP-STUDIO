import type { ApproachModuleMap } from '../types';
import { LISTabulation } from './lis.tabulation';

export const lisApproaches: ApproachModuleMap = {
  tabulation: new LISTabulation(),
};
