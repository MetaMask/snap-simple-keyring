import {
  Json,
  JsonRpcRequest,
  JsonRpcResponse,
  isJsonRpcFailure,
} from '@metamask/utils';
import { v4 as uuid } from 'uuid';

type AccountCapability = 'sign';

type AccountType = 'eip155:eoa' | 'eip155:sca:erc4337';

type KeyringAccount = {
  id: string; // Random ID (UUIDv4)
  name: string; // User-chosen account name (must be unique)
  address: string; // Account address or next receive address (UTXO)
  scopes: string[]; // Supported chains (CAIP-2 IDs)
  options?: Json; // Other account information, keyring-dependent
  capabilities: AccountCapability[]; // Account capabilities
  type: AccountType; // Account type
};

type KeyringRequest = {
  account: string; // Account ID
  scope: string; // CAIP-2 chain ID
  request: Json; // Submitted JSON-RPC request
};

type ListAccountsRequest = {
  jsonrpc: '2.0';
  id: string | number | null;
  method: 'keyring_listAccounts';
};

type ListAccountsResponse = KeyringAccount[];

export type Keyring = {
  // Account methods

  listAccounts(): Promise<KeyringAccount[]>;
  getAccount(id: string): KeyringAccount;
  createAccount(options: Record<string, Json>): KeyringAccount;
  updateAccount(account: KeyringAccount): void;
  deleteAccount(id: string): void;
  exportAccount(id: string): Record<string, Json>;

  // Request methods

  listRequests(): KeyringRequest[];
  getRequest(id: string): KeyringRequest;
  submitRequest(request: KeyringRequest): void;
  deleteRequest(id: string): void;
  approveRequest(id: string): void;
  rejectRequest(id: string): void;
};

export class KeyringClient implements Keyring {
  readonly snapId: string;

  constructor(id: string) {
    this.snapId = id;
  }

  async sendRequest<R extends Json>({
    method,
    params,
  }: {
    method: string;
    params?: Record<string, Json>;
  }): Promise<R> {
    const requestId = uuid();
    // eslint-disable-next-line no-restricted-globals
    const response = (await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          jsonrpc: '2.0',
          id: requestId,
          method,
          params,
        },
      },
    })) as JsonRpcResponse<R>;

    if (response.id !== requestId) {
      throw new Error(
        `Request (${requestId}) and response (${
          response.id ?? 'null'
        }) IDs do not match`,
      );
    }

    if (isJsonRpcFailure(response)) {
      throw new Error(
        `Keyring error (${response.error.code}): ${response.error.message}`,
      );
    }

    return response.result;
  }

  async listAccounts(): Promise<KeyringAccount[]> {
    const res = await this.sendRequest<ListAccountsResponse>({
      method: 'keyring_listAccounts',
    });

    console.log(res);

    return res;
  }

  getAccount(id: string): KeyringAccount {
    throw new Error('Method not implemented.');
  }

  createAccount(options: Record<string, Json>): KeyringAccount {
    throw new Error('Method not implemented.');
  }

  updateAccount(account: KeyringAccount): void {
    throw new Error('Method not implemented.');
  }

  deleteAccount(id: string): void {
    throw new Error('Method not implemented.');
  }

  exportAccount(id: string): Record<string, Json> {
    throw new Error('Method not implemented.');
  }

  listRequests(): KeyringRequest[] {
    throw new Error('Method not implemented.');
  }

  getRequest(id: string): KeyringRequest {
    throw new Error('Method not implemented.');
  }

  submitRequest(request: KeyringRequest): void {
    throw new Error('Method not implemented.');
  }

  deleteRequest(id: string): void {
    throw new Error('Method not implemented.');
  }

  approveRequest(id: string): void {
    throw new Error('Method not implemented.');
  }

  rejectRequest(id: string): void {
    throw new Error('Method not implemented.');
  }
}
