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

type KeyringState = {
  accounts: Record<string, string>;
  pendingRequests: Record<string, any>;
};

type RpcCall = {
  origin: string;
  request: any;
};

/**
 * Returns the current state of the snap.
 */
async function getState(): Promise<KeyringState> {
  const persistedData = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  return persistedData === null
    ? { accounts: {}, pendingRequests: {} }
    : (persistedData as KeyringState);
}

/**
 * Persists the given snap state.
 *
 * @param state - New snap state.
 */
async function saveState(state: KeyringState) {
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
 * Handles RPC calls from the wallet.
 *
 * @param call - RPC call.
 * @param call.request - Request.
 */
async function handleHostInteraction({ request }: RpcCall) {
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

    // error on unknown methods
    default: {
      throw new Error('Method not found.');
    }
  }
}

/**
 * Handles a request from the snap UI.
 *
 * @param call - RPC call.
 * @param call.origin - Caller origin.
 * @param call.request - Request.
 */
async function handleAdminUiInteraction({ origin, request }: RpcCall) {
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
      return await snap.request({
        method: 'snap_manageAccounts',
        params: request.params,
      });
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
 * Checks if the origin is the wallet.
 *
 * @param origin - Caller origin.
 * @returns `true` if the caller is the wallet, `false` otherwise.
 */
function originIsWallet(origin: string): boolean {
  return origin === 'metamask';
}

/**
 * Checks if the origin a (trusted) snap UI.
 *
 * @param origin - Caller origin.
 * @returns `true` if the caller is a trusted snap UI, `false` otherwise.
 */
function originIsSnapUi(origin: string): boolean {
  const { host } = new URL(origin);
  return allowedAdminOrigins.includes(host);
}
