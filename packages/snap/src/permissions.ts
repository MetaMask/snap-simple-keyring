import { KeyringRpcMethod } from '@metamask/keyring-api';

export enum InternalMethod {
  ToggleSyncApprovals = 'snap.internal.toggleSynchronousApprovals',
  IsSynchronousMode = 'snap.internal.isSynchronousMode',
}

export const originPermissions = new Map<string, string[]>([
  [
    'metamask',
    [
      // Keyring methods
      KeyringRpcMethod.ListAccounts,
      KeyringRpcMethod.GetAccount,
      KeyringRpcMethod.FilterAccountChains,
      KeyringRpcMethod.DeleteAccount,
      KeyringRpcMethod.ListRequests,
      KeyringRpcMethod.GetRequest,
      KeyringRpcMethod.SubmitRequest,
      KeyringRpcMethod.RejectRequest,
    ],
  ],
  [
    'http://localhost:8000',
    [
      // Keyring methods
      KeyringRpcMethod.ListAccounts,
      KeyringRpcMethod.GetAccount,
      KeyringRpcMethod.CreateAccount,
      KeyringRpcMethod.FilterAccountChains,
      KeyringRpcMethod.UpdateAccount,
      KeyringRpcMethod.DeleteAccount,
      KeyringRpcMethod.ExportAccount,
      KeyringRpcMethod.ListRequests,
      KeyringRpcMethod.GetRequest,
      KeyringRpcMethod.ApproveRequest,
      KeyringRpcMethod.RejectRequest,
      // Custom methods
      InternalMethod.ToggleSyncApprovals,
      InternalMethod.IsSynchronousMode,
    ],
  ],
  [
    'https://metamask.github.io',
    [
      // Keyring methods
      KeyringRpcMethod.ListAccounts,
      KeyringRpcMethod.GetAccount,
      KeyringRpcMethod.CreateAccount,
      KeyringRpcMethod.FilterAccountChains,
      KeyringRpcMethod.UpdateAccount,
      KeyringRpcMethod.DeleteAccount,
      KeyringRpcMethod.ExportAccount,
      KeyringRpcMethod.ListRequests,
      KeyringRpcMethod.GetRequest,
      KeyringRpcMethod.ApproveRequest,
      KeyringRpcMethod.RejectRequest,
      // Custom methods
      InternalMethod.ToggleSyncApprovals,
      InternalMethod.IsSynchronousMode,
    ],
  ],
]);
