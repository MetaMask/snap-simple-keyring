export enum SnapKeyringMethod {
  ListAccounts = 'keyring_listAccounts',
  CreateAccount = 'keyring_createAccount',
  GetAccount = 'keyring_getAccount',
  UpdateAccount = 'keyring_updateAccount',
  DeleteAccount = 'keyring_deleteAccount',
  ExportAccount = 'keyring_exportAccount',
}

export enum RequestMethods {
  GetRequest = 'keyring_getRequest',
  SubmitRequest = 'keyring_submitRequest',
  ListRequests = 'keyring_listRequests',
  DeleteRequest = 'keyring_deleteRequest',
  ApproveRequest = 'keyring_approveRequest',
  RejectRequest = 'keyring_rejectRequest',
}

export enum InternalMethod {
  Hello = 'snap.internal.hello',
  AwaitEvent = 'snap.internal.awaitEvent',
  GetState = 'snap.internal.getState',
  SetState = 'snap.internal.setState',
  ManageAccounts = 'snap.internal.manageAccounts',
}

export enum SigningMethods {
  SignTransaction = 'sign_transaction',
  SignTypedData = 'eth_signTypedData',
  SignPersonalMessage = 'personal_sign',
  EthSign = 'eth_sign',
}

export const PERMISSIONS = new Map<string, string[]>([
  [
    'metamask',
    [
      SnapKeyringMethod.ListAccounts,
      SnapKeyringMethod.CreateAccount,
      SnapKeyringMethod.DeleteAccount,
      SnapKeyringMethod.UpdateAccount,
      RequestMethods.ListRequests,
      RequestMethods.SubmitRequest,
      RequestMethods.ApproveRequest,
      RequestMethods.RejectRequest,
    ],
  ],
  [
    'http://localhost:8000',
    [
      SnapKeyringMethod.ListAccounts,
      SnapKeyringMethod.CreateAccount,
      SnapKeyringMethod.GetAccount,
      SnapKeyringMethod.UpdateAccount,
      SnapKeyringMethod.DeleteAccount,
      SnapKeyringMethod.ExportAccount,
      RequestMethods.ListRequests,
      RequestMethods.ApproveRequest,
      RequestMethods.DeleteRequest,
      RequestMethods.RejectRequest,
      InternalMethod.AwaitEvent,
      InternalMethod.Hello,
      InternalMethod.GetState,
      InternalMethod.SetState,
      InternalMethod.ManageAccounts,
    ],
  ],
  [
    'https://metamask.github.io',
    [
      SnapKeyringMethod.ListAccounts,
      SnapKeyringMethod.CreateAccount,
      SnapKeyringMethod.GetAccount,
      SnapKeyringMethod.UpdateAccount,
      SnapKeyringMethod.DeleteAccount,
      SnapKeyringMethod.ExportAccount,
      RequestMethods.ListRequests,
      RequestMethods.ApproveRequest,
      RequestMethods.DeleteRequest,
      RequestMethods.RejectRequest,
      InternalMethod.AwaitEvent,
      InternalMethod.Hello,
      InternalMethod.GetState,
      InternalMethod.SetState,
      InternalMethod.ManageAccounts,
    ],
  ],
]);
