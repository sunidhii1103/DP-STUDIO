import { EditDistanceTabulation } from './edit-distance.tabulation';
import { EditDistanceMemoization } from './edit-distance.memoization';

export const editDistanceApproaches = {
  tabulation: new EditDistanceTabulation(),
  memoization: new EditDistanceMemoization(),
};
