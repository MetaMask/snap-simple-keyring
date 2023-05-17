import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, heading, text } from '@metamask/snaps-ui';

import { SimpleKeyringSnap } from './keyring';
import { InternalMethod, PERMISSIONS, SnapKeyringMethod } from './permissions';
import { getState, saveState } from './stateManagement';

export type KeyringState = {
  accounts: Record<string, string>;
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

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log(
    `[SNAP] new request (id=${request.id ?? 'null'}, origin=${origin}):`,
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
      return await simpleKeyringSnap.handleSubmitRequest(request);
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
      return await simpleKeyringSnap.handleApproveRequest(request.params);
    }

    case 'keyring_listAccounts': {
      return [];
    }

    default: {
      throw new Error(`method not found: ${request.method}`);
    }
  }
};
