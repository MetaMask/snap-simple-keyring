import { personalSign, recoverPersonalSignature } from '@metamask/eth-sig-util';
import { Buffer } from 'buffer';

import { defaultSnapOrigin } from '../config';

// this is required by ethereumjs-util
globalThis.Buffer = Buffer;

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

export async function createNewAccount(snapId: string = defaultSnapOrigin) {
  // report address to snap-keyring
  const response = await sendMessageToSnap(snapId, {
    method: 'snap.internal.manageAccounts',
    params: ['create'],
  });

  // add account to state
  const state = await getSnapState(snapId);
  await setSnapState(snapId, state);

  console.log('Account created', response);
}

export async function approvePendingRequest(snapId, id, request) {
  try {
    // prepare signature
    let result;
    switch (request.method) {
      case 'personal_sign': {
        const [data, address] = request.params;
        // get account and private key
        const { accounts } = await getSnapState(snapId);
        const privateKeyHex = accounts[address];
        if (!privateKeyHex) {
          throw new Error(`No private key found for account "${address}"`);
        }
        const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
        // sign message
        const messageBuffer = Buffer.from(data.slice(2), 'hex');
        console.log(
          'Signing message',
          messageBuffer,
          messageBuffer.toString('hex'),
          data,
        );
        const sigHex = personalSign({
          privateKey: privateKeyBuffer,
          data: messageBuffer,
        });
        result = sigHex;
        // verify
        const recoveredAddress = recoverPersonalSignature({
          data: messageBuffer,
          signature: sigHex,
        });
        if (recoveredAddress !== address) {
          throw new Error(
            `Signature verification failed for account "${address}" (got "${recoveredAddress}")`,
          );
        }
        console.log('Signature verified', {
          address,
          sigHex,
          message: messageBuffer.toString('hex'),
        });
        break;
      }
      default: {
        throw new Error(`Signing method "${request.method}" not found.`);
      }
    }

    // submit
    console.log('Approving request', id, request);
    const response = await sendMessageToSnap(snapId, {
      method: 'keyring_approveRequest',
      params: { id },
    });
    console.log('Request approved', response);

    // remove request from state
    const state = await getSnapState(snapId);
    delete state.pendingRequests[id];
    await setSnapState(snapId, state);

    return response;
  } catch (err) {
    console.error(err);
    alert(`Problem happened: ${err.message}` || err);
  }
}

export async function clearPendingRequests(snapId) {
  // remove requestS from state
  const state = await getSnapState(snapId);
  state.pendingRequests = {};
  await setSnapState(snapId, state);
}
