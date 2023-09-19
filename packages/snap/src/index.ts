import {
  MethodNotSupportedError,
  handleKeyringRequest,
  isKeyringRpcMethod,
} from '@metamask/keyring-api';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

import { SimpleKeyring } from './keyring';
import { InternalMethod, originPermissions } from './permissions';
import { getState } from './stateManagement';

let keyring: SimpleKeyring;

/**
 * Return the keyring instance. If it doesn't exist, create it.
 */
async function getKeyring(): Promise<SimpleKeyring> {
  if (!keyring) {
    const state = await getState();
    if (!keyring) {
      keyring = new SimpleKeyring(state);
    }
  }
  return keyring;
}

/**
 * Verify if the caller can call the requested method.
 *
 * @param origin - Caller origin.
 * @param method - Method being called.
 * @returns True if the caller is allowed to call the method, false otherwise.
 */
function hasPermission(origin: string, method: string): boolean {
  return originPermissions.get(origin)?.includes(method) ?? false;
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  request,
  origin,
}) => {
  // Log request.
  console.log(
    `Snap request (id=${request.id ?? 'null'}, origin=${origin}):`,
    request,
  );

  // Check if origin is allowed to call method.
  if (!hasPermission(origin, request.method)) {
    throw new Error(
      `Origin '${origin}' is not allowed to call '${request.method}'`,
    );
  }

  // Handle keyring methods.
  if (isKeyringRpcMethod(request.method)) {
    return handleKeyringRequest(await getKeyring(), request as any);
  }

  // Handle custom methods.
  switch (request.method) {
    case InternalMethod.ToggleSyncApprovals: {
      return (await getKeyring()).toggleSyncApprovals();
    }

    case InternalMethod.IsSynchronousMode: {
      return (await getKeyring()).isSynchronousMode();
    }

    default: {
      throw new MethodNotSupportedError(request.method);
    }
  }
};
