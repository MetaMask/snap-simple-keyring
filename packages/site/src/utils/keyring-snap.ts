import type { KeyringAccount, KeyringRequest } from '@metamask/keyring-api';

import { getEthereumProvider } from './provider';

export type KeyringState = {
  pendingRequests: KeyringRequest[];
  accounts: KeyringAccount[];
  useSynchronousApprovals: boolean;
};

/**
 * Send a request to a snap.
 *
 * @param snapId - ID of the snap to send the request to.
 * @param request - Request to send to the snap.
 * @returns Promise resolving to the snap's response.
 */
export async function sendMessageToSnap(
  snapId: string,
  request: any,
): Promise<unknown> {
  return getEthereumProvider().request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request,
    },
  });
}
