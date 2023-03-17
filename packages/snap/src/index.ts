import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';

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

type WalletState = {
  accounts: Record<string, string>;
  pendingRequests: Record<string, any>;
};

/**
 *
 */
async function getState(): Promise<WalletState> {
  const persistedData = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  if (!persistedData) {
    return {
      accounts: {},
      pendingRequests: {},
    };
  }
  return persistedData as WalletState;
}

/**
 *
 * @param state
 */
async function saveState(state: any) {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: state },
  });
}

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
      const { params: signatureRequest } = request;
      const { id } = signatureRequest;
      const state = await getState();
      state.pendingRequests[id] = signatureRequest;
      await saveState(state);
      return;
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
    case 'hello': {
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    }
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
function originIsWallet(origin) {
  return origin === 'metamask';
}

/**
 *
 * @param origin
 */
function originIsSnapUi(origin) {
  const { host } = new URL(origin);
  return allowedAdminOrigins.includes(host);
}
