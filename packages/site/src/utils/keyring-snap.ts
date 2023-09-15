import type { KeyringAccount, KeyringRequest } from '@metamask/keyring-api';

export type KeyringState = {
  pendingRequests: KeyringRequest[];
  accounts: KeyringAccount[];
  useSynchronousApprovals: boolean;
};

/**
 * Send a request to a snap.
 *
 * @param snapId - The snap ID.
 * @param request - The request to send.
 * @returns The response from the snap.
 */
export async function sendMessageToSnap(snapId: string, request: any) {
  return window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request,
    },
  });
}
