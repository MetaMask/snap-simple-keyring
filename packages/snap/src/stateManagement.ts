import type { KeyringState } from './keyring';

/**
 * Default keyring state.
 */
const defaultState: KeyringState = {
  wallets: {},
  pendingRequests: {},
  useSyncApprovals: true,
};

/**
 * Retrieves the current state of the keyring.
 *
 * @returns The current state of the keyring.
 */
export async function getState(): Promise<KeyringState> {
  const state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as any;

  console.log('[Snap] get state', state);

  return {
    ...defaultState,
    ...state,
  };
}

/**
 * Persists the given snap state.
 *
 * @param state - New snap state.
 */
export async function saveState(state: KeyringState) {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: state },
  });
}
