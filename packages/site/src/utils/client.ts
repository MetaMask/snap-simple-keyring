import { Json } from '@metamask/utils';
import { v4 as uuid } from 'uuid';

type AccountCapability = 'sign';

type AccountType = 'eip155:eoa' | 'eip155:sca:erc4337';

type KeyringAccount = {
  id: string; // Random ID (UUIDv4)
  name: string; // User-chosen account name (must be unique)
  address: string; // Account address or next receive address (UTXO)
  chains: string[]; // Supported chains (CAIP-2 IDs)
  options?: Json; // Other account information, keyring-dependent
  capabilities: AccountCapability[]; // Account capabilities
  type: AccountType; // Account type
};

type KeyringRequest = {
  account: string; // Account ID
  scope: string; // CAIP-2 chain ID
  request: Json; // Submitted JSON-RPC request
};

export type Keyring = {
  // Account methods

  listAccounts(): Promise<KeyringAccount[]>;
  getAccount(id: string): Promise<KeyringAccount>;
  createAccount(
    name: string,
    chains: string[],
    options?: Record<string, Json>,
  ): Promise<KeyringAccount>;
  updateAccount(account: KeyringAccount): Promise<void>;
  deleteAccount(id: string): Promise<void>;
  exportAccount(id: string): Promise<Record<string, Json>>;

  // Request methods

  listRequests(): Promise<KeyringRequest[]>;
  getRequest(id: string): Promise<KeyringRequest>;
  submitRequest(request: KeyringRequest): Promise<void>;
  approveRequest(id: string): Promise<void>;
  rejectRequest(id: string): Promise<void>;
};

export class KeyringClient implements Keyring {
  readonly snapId: string;

  constructor(id: string) {
    this.snapId = id;
  }

  // eslint-disable-next-line no-restricted-syntax
  private async sendRequest<Response extends Json>({
    method,
    params,
  }: {
    method: string;
    params?: Record<string, Json | undefined>;
  }): Promise<Response> {
    // eslint-disable-next-line no-restricted-globals
    return (await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          jsonrpc: '2.0',
          id: uuid(),
          method,
          params,
        },
      },
    })) as Response;
  }

  async listAccounts(): Promise<KeyringAccount[]> {
    return await this.sendRequest<KeyringAccount[]>({
      method: 'keyring_listAccounts',
    });
  }

  async getAccount(id: string): Promise<KeyringAccount> {
    return await this.sendRequest<KeyringAccount>({
      method: 'keyring_getAccount',
      params: { id },
    });
  }

  async createAccount(
    name: string,
    chains: string[],
    options?: Record<string, Json>,
  ): Promise<KeyringAccount> {
    return await this.sendRequest<KeyringAccount>({
      method: 'keyring_createAccount',
      params: { name, chains, options },
    });
  }

  async updateAccount(account: KeyringAccount): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteAccount(id: string): Promise<void> {
    await this.sendRequest<null>({
      method: 'keyring_deleteAccount',
      params: { id },
    });
  }

  async exportAccount(id: string): Promise<Record<string, Json>> {
    throw new Error('Method not implemented.');
  }

  async listRequests(): Promise<KeyringRequest[]> {
    throw new Error('Method not implemented.');
  }

  async getRequest(id: string): Promise<KeyringRequest> {
    throw new Error('Method not implemented.');
  }

  async submitRequest(request: KeyringRequest): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async approveRequest(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async rejectRequest(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
