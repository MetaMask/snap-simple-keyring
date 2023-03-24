import { OnRpcRequestHandler } from '@metamask/snaps-types';

import { getState, saveState } from './stateManagement';
import { signPersonalMessage } from './transactionManagementOperation';

const allowedAdminOrigins = ['localhost:8000', 'lavamoat.github.io'];

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */

export type WalletState = {
  accounts: Record<string, string>; // <caip10 account,privateKeyHex>
  pendingRequests: Record<string, any>;
};

export type SerializedWalletState = {
  accounts: string[]; // string of caip10accounts
  pendingRequests: Record<string, any>;
};

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log('snap saw request:', origin, request);

  if (originIsWallet(origin)) {
    return handleHostInteraction({ origin, request });
  } else if (originIsSnapUi(origin)) {
    return handleAdminUiInteraction({ origin, request });
  }
  throw new Error(`Unrecognized origin: "${origin}"`);
};

/**
 *
 * @param options0
 * @param options0.origin
 * @param options0.request
 */
async function handleHostInteraction({ origin, request }) {
  switch (request.method) {
    // incomming signature requests
    case 'snap_keyring_sign_request': {
      const { method, params } = request.params;
      if (method === 'personal_sign') {
        const [personalMessage, address] = params;
        return signPersonalMessage(address, personalMessage);
      }
      break;
    }
    case 'snap_manageAccounts': {
      // forwarding to snap-keyring
      return await snap.request({
        method: 'snap_manageAccounts',
        params: request.params,
      });
    }
    // error on unknown methods
    default: {
      throw new Error('Method not found.');
    }
  }
}

/**
 *
 * @param options0
 * @param options0.origin
 * @param options0.request
 */
async function handleAdminUiInteraction({ origin, request }) {
  switch (request.method) {
    // forward all management requests to metamask to be handled by the snap-keyring
    case 'manageAccounts': {
      // forwarding to snap-keyring
      await snap.request({
        method: 'snap_manageAccounts',
        params: request.params,
      });
      if (request.params[0] === 'delete') {
        const state = await getState();
        delete state.accounts[request.params[1]];
        await saveState(state);
      }
      return;
    }
    // state mgmt
    case 'snap_keyring_state_get': {
      const state = await getState();
      console.log('snap_keyring_state get', state);
      return state;
    }
    case 'snap_keyring_state_set': {
      const { state } = request.params;
      await saveState(state);
      console.log('snap_keyring_state set', state);
      return;
    }
    // forward all management requests to metamask to be handled by the snap-keyring
    case 'snap_keyring_sign_approve': {
      const { id, signature } = request.params;
      const state = await getState();
      const signatureRequest = state.pendingRequests[id];
      if (!signatureRequest) {
        throw new Error('No pending request found.');
      }
      // submit to the snap-keyring
      await snap.request({
        method: 'snap_manageAccounts',
        params: request.params,
      });
      // delete the pending request
      delete state.pendingRequests[id];
      await saveState(state);
      return;
    }
    // error on unknown methods
    default: {
      throw new Error('Method not found.');
    }
  }
}

/**
 *
 * @param origin
 */
function originIsWallet(origin: string) {
  return origin === 'metamask';
}

/**
 *
 * @param origin
 */
function originIsSnapUi(origin: string) {
  const { host } = new URL(origin);
  return allowedAdminOrigins.includes(host);
}
