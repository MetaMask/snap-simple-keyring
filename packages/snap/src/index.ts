import {
  MethodNotSupportedError,
  buildHandlersChain,
  keyringRpcDispatcher,
} from '@metamask/keyring-api';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, heading, text } from '@metamask/snaps-ui';

import { SimpleKeyring } from './keyring2';
import { InternalMethod, PERMISSIONS } from './permissions';
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
 * Log the requests.
 *
 * @param args - Request arguments.
 * @param args.origin - Caller origin.
 * @param args.request - Request to execute.
 * @returns Nothing, always throws `MethodNotSupportedError`.
 */
const loggerHandler: OnRpcRequestHandler = async ({ origin, request }) => {
  console.log(
    `[Snap] request (id=${request.id ?? 'null'}, origin=${origin}):`,
    request,
  );
  throw new MethodNotSupportedError(request.method);
};

/**
 * Handle execution permissions.
 *
 * @param args - Request arguments.
 * @param args.origin - Caller origin.
 * @param args.request - Request to execute.
 * @returns Nothing, throws `MethodNotSupportedError` if the caller IS allowed
 * to call the method, throws an `Error` otherwise.
 */
const permissionsHandler: OnRpcRequestHandler = async ({
  origin,
  request,
}): Promise<never> => {
  if (!hasPermission(origin, request.method)) {
    throw new Error(`origin ${origin} cannot call method ${request.method}`);
  }
  throw new MethodNotSupportedError(request.method);
};

/**
 * Handle keyring requests.
 *
 * @param args - Request arguments.
 * @param args.request - Request to execute.
 * @returns The execution result.
 */
const keyringHandler: OnRpcRequestHandler = async ({ request }) => {
  if (!keyring) {
    const keyringState = await getState();
    if (!keyring) {
      keyring = new SimpleKeyring(keyringState);
    }
  }
  return await keyringRpcDispatcher(keyring, request);
};

/**
 * Execute a custom snap request.
 *
 * @param args - Request arguments.
 * @param args.request - Request to execute.
 * @returns The execution result.
 */
const customHandler: OnRpcRequestHandler = async ({
  request,
}): Promise<any> => {
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

    default: {
      throw new MethodNotSupportedError(request.method);
    }
  }
};

export const onRpcRequest: OnRpcRequestHandler = buildHandlersChain([
  loggerHandler,
  permissionsHandler,
  keyringHandler,
  customHandler,
]);
