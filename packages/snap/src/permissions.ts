export enum SnapKeyringMethod {
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

export enum InternalMethod {
  Hello = 'snap.internal.hello',
  AwaitEvent = 'snap.internal.awaitEvent',
  GetState = 'snap.internal.getState',
  SetState = 'snap.internal.setState',
  ManageAccounts = 'snap.internal.manageAccounts',
}

export const PERMISSIONS = new Map<string, string[]>([
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
