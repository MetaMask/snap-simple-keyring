import { Address } from '@ethereumjs/util';
import { personalSign, recoverPersonalSignature } from '@metamask/eth-sig-util';
import { Buffer } from 'buffer';

import { defaultSnapOrigin } from '../config';

// this is required by ethereumjs-util
globalThis.Buffer = Buffer;

export async function sendMessageToSnap(
  snapId: string = defaultSnapOrigin,
  message: any,
) {
  return window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: message,
    },
  });
}

export async function getSnapState(snapId: string = defaultSnapOrigin) {
  return sendMessageToSnap(snapId, {
    method: 'snap_keyring_state_get',
    params: [],
  });
}

export async function setSnapState(
  snapId: string = defaultSnapOrigin,
  snapState: any,
) {
  return sendMessageToSnap(snapId, {
    method: 'snap_keyring_state_set',
    params: { state: snapState },
  });
}

export async function createNewAccount(snapId: string = defaultSnapOrigin) {
  // create new account
  const privateKey = new Uint8Array(32);
  window.crypto.getRandomValues(privateKey);
  const privateKeyBuffer = Buffer.from(privateKey);
  const address = Address.fromPrivateKey(privateKeyBuffer);
  const account = {
    address: address.toString(),
    privateKey: privateKeyBuffer.toString('hex'),
  };

  // report address to snap-keyring
  const response = await sendMessageToSnap(snapId, {
    method: 'manageAccounts',
    params: ['create', account.address],
  });

  // add account to state
  const state = await getSnapState(snapId);

  const { accounts = {} } = state;
  accounts[account.address] = account.privateKey;
  state.accounts = accounts;
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
      method: 'manageAccounts',
      params: ['submit', { id, result }],
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
