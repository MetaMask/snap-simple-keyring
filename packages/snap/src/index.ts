import {
  MethodNotSupportedError,
  handleKeyringRequest,
} from '@metamask/keyring-api';
import type {
  OnKeyringRequestHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

import { SimpleKeyring } from './keyring';
import { logger } from './logger';
import { InternalMethod, originPermissions } from './permissions';
import { getState } from './stateManagement';

let keyringInstance: SimpleKeyring;

/**
 * Return the keyring instance. If it doesn't exist, create it.
 */
async function getKeyring(): Promise<SimpleKeyring> {
  if (!keyringInstance) {
    const state = await getState();
    if (!keyringInstance) {
      keyringInstance = new SimpleKeyring(state);
    }
  }
  return keyringInstance;
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
  origin,
  request,
}) => {
  logger.debug(
    `RPC request (origin="${origin}"):`,
    JSON.stringify(request, undefined, 2),
  );

  // Check if origin is allowed to call method.
  if (!hasPermission(origin, request.method)) {
    throw new Error(
      `Origin '${origin}' is not allowed to call '${request.method}'`,
    );
  }

  // Handle custom methods.
  const keyring = await getKeyring();
  switch (request.method) {
    case InternalMethod.ToggleSyncApprovals: {
      await keyring.toggleSyncApprovals();
      return null;
    }

    case InternalMethod.IsSynchronousMode: {
      return keyring.isSynchronousMode();
    }

    default: {
      throw new MethodNotSupportedError(request.method);
    }
  }
};

export const onKeyringRequest: OnKeyringRequestHandler = async ({
  origin,
  request,
}) => {
  logger.debug(
    `Keyring request (origin="${origin}"):`,
    JSON.stringify(request, undefined, 2),
  );

  // Check if origin is allowed to call method.
  if (!hasPermission(origin, request.method)) {
    throw new Error(
      `Origin '${origin}' is not allowed to call '${request.method}'`,
    );
  }

  // Handle keyring methods.
  const keyring = await getKeyring();
  return (await handleKeyringRequest(keyring, request)) ?? null;
};
