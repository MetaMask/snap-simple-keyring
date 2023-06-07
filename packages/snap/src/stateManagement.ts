import { KeyringState } from '.';

/**
 * Retrieves the current state of the keyring.
 *
 * @returns The current state of the keyring.
 */
export async function getState(): Promise<KeyringState> {
  const persistedData = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as KeyringState;

  console.log('[Snap] get state', persistedData);

  if (!persistedData) {
    return {
      accounts: {},
      pendingRequests: {},
    };
  }

  return persistedData;
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

/**
 * Retrieves the serialized state of the keyring.
 *
 * @returns The serialized state of the keyring.
 */
export async function getSerializedState() {
  const persistedData = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as KeyringState;

  if (!persistedData) {
    return {
      accounts: [],
      pendingRequests: {},
    };
  }

  const cleanedData = {
    ...persistedData,
    accounts: Object.keys(persistedData.accounts),
  };

  return cleanedData;
}
