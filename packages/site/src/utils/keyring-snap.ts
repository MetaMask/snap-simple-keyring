import { KeyringAccount, KeyringRequest } from '@metamask/keyring-api';

import { defaultSnapOrigin } from '../config';

export type KeyringState = {
  pendingRequests: KeyringRequest[];
  accounts: KeyringAccount[];
  useSynchronousApprovals: boolean;
};

export async function sendMessageToSnap(snapId: string, message: any) {
  return window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: message,
    },
  });
}

export async function awaitEvent(
  snapId: string,
  callback: (e: any) => boolean,
): Promise<any> {
  let snapEvent: any;
  do {
    snapEvent = await sendMessageToSnap(snapId, {
      method: 'snap.internal.awaitEvent',
    });
  } while (!callback(snapEvent));
}

export async function getSnapState(snapId: string = defaultSnapOrigin) {
  return (await sendMessageToSnap(snapId, {
    method: 'snap.internal.getState',
    params: [],
  })) as KeyringState;
}

export async function setSnapState(
  // eslint-disable-next-line @typescript-eslint/default-param-last
  snapId: string = defaultSnapOrigin,
  snapState: any,
) {
  return sendMessageToSnap(snapId, {
    method: 'snap.internal.setState',
    params: { state: snapState },
  });
}
