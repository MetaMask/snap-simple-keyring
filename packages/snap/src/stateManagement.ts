import { KeyringState } from './keyring2';

/**
 * Retrieves the current state of the keyring.
 *
 * @returns The current state of the keyring.
 */
export async function getState(): Promise<KeyringState> {
  const state = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  console.log('[Snap] get state', state);

  return {
    wallets: {},
    requests: {},
    ...state,
  } as KeyringState;
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
      wallets: {},
      requests: {},
    };
  }

  const cleanedData = {
    ...persistedData,
    accounts: Object.keys(persistedData.weallets),
  };

  return cleanedData;
}
