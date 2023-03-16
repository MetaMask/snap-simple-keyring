import { isLocalSnap } from './snap';
import { Snap } from '../types';

export const shouldDisplayReconnectButton = (installedSnap?: Snap) =>
  installedSnap && isLocalSnap(installedSnap?.id);
