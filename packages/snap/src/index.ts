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
      wallets: {},
      requests: {},
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
    case InternalMethod.GetState: {
      logRequest(InternalMethod.GetState, request);
      return await getState();
    }

    // Request Methods
    case RequestMethods.SubmitRequest: {
      logRequest(RequestMethods.SubmitRequest, request);
      return await simpleKeyringSnap.submitRequest(
        request.params as KeyringRequest,
      );
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

    case SnapKeyringMethod.CreateAccount: {
      logRequest(SnapKeyringMethod.CreateAccount, request.params);
      const req = request.params as {
        name: string;
        chains: string[];
        options?: Record<string, Json>;
      };
      return await simpleKeyringSnap.createAccount(
        req.name,
        req.chains,
        req.options,
      );
    }

    default: {
      throw new Error(`method not found: ${request.method}`);
    }
  }
}

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) =>
  await dispatcher(origin, request);
