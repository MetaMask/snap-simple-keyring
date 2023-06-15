import { defaultSnapOrigin } from '../config';

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
  return sendMessageToSnap(snapId, {
    method: 'snap.internal.getState',
    params: [],
  });
}

export async function setSnapState(
  snapId: string = defaultSnapOrigin,
  snapState: any,
) {
  return sendMessageToSnap(snapId, {
    method: 'snap.internal.setState',
    params: { state: snapState },
  });
}
