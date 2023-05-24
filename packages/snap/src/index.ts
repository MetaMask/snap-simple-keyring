import {
  OnRpcRequestHandler,
  Json,
  JsonRpcRequest,
} from '@metamask/snaps-types';
import { panel, heading, text } from '@metamask/snaps-ui';

import { SimpleKeyringSnap, Account } from './keyring';
import { SimpleKeyringSnap2 } from './keyring2';
import { InternalMethod, PERMISSIONS, SnapKeyringMethod } from './permissions';
import { getState, saveState } from './stateManagement';

export type KeyringState = {
  accounts: Record<string, Account>;
  pendingRequests: Record<string, any>;
};

export type SerializedKeyringState = {
  accounts: string[];
  pendingRequests: Record<string, any>;
};

/**
 * Verify if the caller can call the requested method.
 *
 * @param origin - Caller origin.
 * @param method - Method being called.
 * @returns True if the caller is allowed to call the method, false otherwise.
 */
function hasPermission(origin: string, method: string): boolean {
  return Boolean(PERMISSIONS.get(origin)?.includes(method));
}

const keyring = new SimpleKeyringSnap2();

/**
 * Execute a JSON-RPC request.
 *
 * @param origin - Request origin.
 * @param request - Request to execute.
 * @returns The execution result.
 */
async function dispatcher(
  origin: string,
  request: JsonRpcRequest,
): Promise<any> {
  console.log(
    `[SNAP] request (id=${request.id ?? 'null'}, origin=${origin}):`,
    request,
  );

  if (!hasPermission(origin, request.method)) {
    throw new Error(`origin ${origin} cannot call method ${request.method}`);
  }

  let persistedState = await getState();
  if (!persistedState) {
    persistedState = {
      accounts: {},
      pendingRequests: {},
    };
    await saveState(persistedState);
  }

  const simpleKeyringSnap = new SimpleKeyringSnap(persistedState);

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
      console.log(JSON.stringify(request));
      return await simpleKeyringSnap.handleSubmitRequest(request);
      // return keyring.submitRequest({});
    }

    case InternalMethod.ManageAccounts: {
      return await simpleKeyringSnap.handleManageAccounts(request.params);
    }

    case InternalMethod.GetState: {
      return await simpleKeyringSnap.handleGetState();
    }

    case InternalMethod.SetState: {
      return await simpleKeyringSnap.handleSetState(request);
    }

    case SnapKeyringMethod.ApproveRequest: {
      console.log(
        '[SNAP] (dispatcher) ApproveRequest',
        JSON.stringify(request),
      );
      return await simpleKeyringSnap.handleApproveRequest(request.params);
    }

    case 'keyring_listAccounts': {
      return await keyring.listAccounts();
    }

    case 'keyring_createAccount': {
      console.log(request.params);
      const req = request.params as {
        name: string;
        chains: string[];
        options?: Record<string, Json>;
      };
      return await keyring.createAccount(req.name, req.chains, req.options);
    }

    default: {
      throw new Error(`method not found: ${request.method}`);
    }
  }
}

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) =>
  await dispatcher(origin, request);
