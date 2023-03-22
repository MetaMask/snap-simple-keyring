import { SerializedWalletState, WalletState } from '.';

/**
 *
 */
export async function getState(): Promise<WalletState> {
  const persistedData = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as WalletState;

  if (!persistedData) {
    return {
      accounts: {},
      pendingRequests: {},
    };
  }

  return persistedData;
}

/**
 *
 * @param state
 */
export async function saveState(state: WalletState) {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: state },
  });
}

/**
 *
 */
export async function getSerializedState(): Promise<SerializedWalletState> {
  const persistedData = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as WalletState;

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
