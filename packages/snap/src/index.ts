import { KeyringRequest } from '@metamask/keyring-api';
import {
  ApproveRequestRequest,
  RejectRequestRequest,
} from '@metamask/keyring-api/dist/keyring-internal-api';
import {
  OnRpcRequestHandler,
  Json,
  JsonRpcRequest,
} from '@metamask/snaps-types';
import { panel, heading, text } from '@metamask/snaps-ui';

import { KeyringState, SimpleKeyringSnap2 } from './keyring2';
import {
  InternalMethod,
  PERMISSIONS,
  RequestMethods,
  SnapKeyringMethod,
} from './permissions';
import { getState, saveState } from './stateManagement';
import { logRequest } from './util';

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

// eslint-disable-next-line no-var
var simpleKeyringSnap: SimpleKeyringSnap2;

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

  let persistedState: KeyringState = await getState();
  if (!persistedState) {
    persistedState = {
      accounts: {},
      pendingRequests: {},
    };
    await saveState(persistedState);
  }

  if (!simpleKeyringSnap) {
    simpleKeyringSnap = new SimpleKeyringSnap2(persistedState);
  }

  switch (request.method) {
    // internal methods
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
