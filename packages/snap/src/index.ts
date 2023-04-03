import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, heading, text } from '@metamask/snaps-ui';

import { createAccount, upsertAccount } from './accountManagement';
import { getState, saveState } from './stateManagement';
import {
  signPersonalMessage,
  signTransaction,
} from './transactionManagementOperation';

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

export type KeyringState = {
  accounts: Record<string, string>;
  pendingRequests: Record<string, any>;
};

export type SerializedKeyringState = {
  accounts: string[];
  pendingRequests: Record<string, any>;
};

/**
 * Handle request to sign a transaction or message.
 *
 * @param request - Signature request.
 */
/**
 *
 * @param request
 */
async function handleSubmitRequest(request: any) {
  const { params: signatureRequest } = request;
  const { id } = signatureRequest;
  const state = await getState();

  state.pendingRequests[id] = signatureRequest;
  await saveState(state);
}

/**
 * Handle request to set snap state.
 *
 * @param request - Set state request.
 */
async function handleSetState(request: any) {
  const { state } = request.params;
  await saveState(state);
  console.log('snap_keyring_state set', state);
}

/**
 * Handle request to get snap state.
 *
 * @returns Promise of the snap state.
 */
async function handleGetState(): Promise<any> {
  const state = await getState();
  console.log('snap_keyring_state get', state);
  return state;
}

/**
 * Handle request to manage accounts.
 *
 * This function is a pass-through between the snap UI and the SnapController.
 *
 * @param params - Parameter to the manageAccounts method.
 * @returns Pass-through response from the SnapController.
 */
async function handleManageAccounts(params: any) {
  console.log('[SNAP] handleManageAccounts', params);
  const [method] = params;

  switch (method) {
    case 'create': {
      const account = createAccount();
      await upsertAccount(account);
      console.log(account);
      return await snap.request({
        method: 'snap_manageAccounts',
        params: ['create', account.address],
      });
    }
    default:
      throw new Error('Invalid method.');
  }
}

/**
 * Handle request to approve a signature request.
 *
 * @param payload - Parameter to forward to the SnapController.
 */
async function handleApproveRequest(payload: any) {
  console.log('in handleApproveRequest', JSON.stringify(payload));
  const { id: requestId } = payload;

  const state = await getState();
  const request = state.pendingRequests[requestId];
  const [data, address] = request.params;

  console.log(payload);

  switch (request.method) {
    case 'personal_sign': {
      return await signPersonalMessage(address, data);
    }
    case 'eth_sendTransaction': {
      return await signTransaction(address, data, chainOpts);
    }
    case 'eth_signTransaction': {
      return await signTransaction(address, data, chainOpts);
    }
    case 'eth_signTypedData': {
      return await signTransaction(address, data, chainOpts);
    }
    default:
      throw new Error('Invalid Approval Method.');
  }
}

enum SnapKeyringMethod {
  ListAccounts = 'keyring_listAccounts',
  CreateAccount = 'keyring_createAccount',
  GetAccount = 'keyring_getAccount',
  UpdateAccount = 'keyring_updateAccount',
  RemoveAccount = 'keyring_removeAccount',
  ImportAccount = 'keyring_importAccount',
  ExportAccount = 'keyring_exportAccount',
  ListRequests = 'keyring_listRequests',
  SubmitRequest = 'keyring_submitRequest',
  GetRequest = 'keyring_getRequest',
  ApproveRequest = 'keyring_approveRequest',
  RemoveRequest = 'keyring_removeRequest',
}

enum InternalMethod {
  Hello = 'snap.internal.hello',
  AwaitEvent = 'snap.internal.awaitEvent',
  GetState = 'snap.internal.getState',
  SetState = 'snap.internal.setState',
  ManageAccounts = 'snap.internal.manageAccounts',
}

const PERMISSIONS = new Map<string, string[]>([
  [
    'metamask',
    [
      SnapKeyringMethod.ListAccounts,
      SnapKeyringMethod.ListRequests,
      SnapKeyringMethod.SubmitRequest,
      SnapKeyringMethod.ApproveRequest,
      SnapKeyringMethod.RemoveRequest,
    ],
  ],
  [
    'http://localhost:8000',
    [
      SnapKeyringMethod.ListAccounts,
      SnapKeyringMethod.CreateAccount,
      SnapKeyringMethod.GetAccount,
      SnapKeyringMethod.UpdateAccount,
      SnapKeyringMethod.RemoveAccount,
      SnapKeyringMethod.ImportAccount,
      SnapKeyringMethod.ExportAccount,
      SnapKeyringMethod.ListRequests,
      SnapKeyringMethod.ApproveRequest,
      InternalMethod.AwaitEvent,
      InternalMethod.Hello,
      InternalMethod.GetState,
      InternalMethod.SetState,
      InternalMethod.ManageAccounts,
    ],
  ],
]);

/**
 * Verify if the caller can call the requested method.
 *
 * @param origin - Caller origin.
 * @param method - Method being called.
 * @returns True if the caller is allowed to call the method, false otherwise.
 */
/**
 *
 * @param origin
 * @param method
 */
function hasPermission(origin: string, method: string): boolean {
  return Boolean(PERMISSIONS.get(origin)?.includes(method));
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log('[SNAP] new request:', origin, request);

  if (!hasPermission(origin, request.method)) {
    throw new Error(`origin ${origin} cannot call method ${request.method}`);
  }

  switch (request.method) {
    case InternalMethod.Hello: {
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([
            heading('Something happened in the system'),
            text('The thing that happened is...'),
          ]),
        },
      });
    }
    case SnapKeyringMethod.SubmitRequest: {
      return await handleSubmitRequest(request);
    }

    case InternalMethod.ManageAccounts: {
      return await handleManageAccounts(request.params);
    }

    case InternalMethod.GetState: {
      return await handleGetState();
    }

    case InternalMethod.SetState: {
      return await handleSetState(request);
    }

    case SnapKeyringMethod.ApproveRequest: {
      return await handleApproveRequest(request.params);
    }

    default: {
      throw new Error(`method not found: ${request.method}`);
    }
  }
};
