import { KeyringRequest, keyringRpcDispatcher } from '@metamask/keyring-api';
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

import { SimpleKeyring } from './keyring2';
import {
  InternalMethod,
  PERMISSIONS,
  RequestMethods,
  SnapKeyringMethod,
} from './permissions';
import { getState } from './stateManagement';
import { logRequest } from './util';

let keyring: SimpleKeyring;

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
    `[Snap] request (id=${request.id ?? 'null'}, origin=${origin}):`,
    request,
  );

  if (!hasPermission(origin, request.method)) {
    throw new Error(`origin ${origin} cannot call method ${request.method}`);
  }

  const keyringState = await getState();
  if (!keyring) {
    keyring = new SimpleKeyring(keyringState);
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
      return await keyring.submitRequest(request.params as KeyringRequest);
    }

    case RequestMethods.ApproveRequest: {
      logRequest(RequestMethods.ApproveRequest, request);
      return await keyring.approveRequest(
        (request.params as ApproveRequestRequest).params.id,
      );
    }

    case RequestMethods.RejectRequest: {
      logRequest(RequestMethods.RejectRequest, request.params);
      return await keyring.rejectRequest(
        (request.params as RejectRequestRequest).params.id,
      );
    }

    // Keyring Methods
    case SnapKeyringMethod.ListAccounts: {
      logRequest(SnapKeyringMethod.ListAccounts, request.params);
      return await keyring.listAccounts();
    }

    case SnapKeyringMethod.CreateAccount: {
      logRequest(SnapKeyringMethod.CreateAccount, request.params);
      const req = request.params as {
        name: string;
        options?: Record<string, Json>;
      };
      return await keyring.createAccount(req.name, req.options);
    }

    case SnapKeyringMethod.DeleteAccount: {
      const req = request.params as {
        id: string;
      };
      return await keyring.deleteAccount(req.id);
    }

    default: {
      throw new Error(`method not found: ${request.method}`);
    }
  }
}

const keyringHandler: OnRpcRequestHandler = async ({ request }) => {
  return await keyringRpcDispatcher(keyring, request);
};

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) =>
  await dispatcher(origin, request);
