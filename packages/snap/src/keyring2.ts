import { Address } from '@ethereumjs/util';
import { Keyring, KeyringAccount, KeyringRequest } from '@metamask/keyring-api';
import { Json } from '@metamask/snaps-types';
import { v4 as uuid } from 'uuid';

export type Wallet = {
  account: KeyringAccount;
  privateKey: string;
};

export class SimpleKeyringSnap2 implements Keyring {
  #wallets: Record<string, Wallet>;

  #requests: Record<string, KeyringRequest>;

  constructor() {
    this.#wallets = {};
    this.#requests = {};
  }

  async listAccounts(): Promise<KeyringAccount[]> {
    return Object.values(this.#wallets).map((wallet) => wallet.account);
  }

  async getAccount(id: string): Promise<KeyringAccount | undefined> {
    return this.#wallets[id].account;
  }

  async createAccount(
    name: string,
    chains: string[],
    options: Record<string, Json> | null = null,
  ): Promise<KeyringAccount> {
    const { privateKey, address } = this.#generatePrivateKey();
    const account: KeyringAccount = {
      id: uuid(),
      name,
      chains,
      options,
      address,
      capabilities: ['sign'],
      type: 'eip155:eoa',
    };

    this.#wallets[account.id] = { account, privateKey };
    await snap.request({
      method: 'snap_manageAccounts',
      params: ['create', account.address],
    });

    return account;
  }

  async updateAccount(account: KeyringAccount): Promise<void> {
    const currentAccount = this.#wallets[account.id].account;
    const newAccount = {
      ...currentAccount,
      ...account,
      // Restore read-only properties.
      address: currentAccount.address,
      capabilities: currentAccount.capabilities,
      type: currentAccount.type,
      options: currentAccount.options,
    };

    // TODO: check if account name is valid (unique)
    // TODO: update the KeyringController
    this.#wallets[account.id].account = newAccount;
  }

  async deleteAccount(id: string): Promise<void> {
    // TODO: update the KeyringController
    delete this.#wallets[id];
  }

  async exportAccount(id: string): Promise<Record<string, Json>> {
    return {
      privateKey: this.#wallets[id].privateKey,
    };
  }

  async listRequests(): Promise<KeyringRequest[]> {
    return Object.values(this.#requests);
  }

  async getRequest(id: string): Promise<KeyringRequest> {
    return this.#requests[id];
  }

  async submitRequest(request: KeyringRequest): Promise<void> {
    this.#requests[request.request.id] = request;
  }

  async approveRequest(id: string): Promise<void> {
    const request = this.#requests[id];
    const wallet = this.#wallets[request.account];

    // TODO: sign request
    // TODO: notify extension
    throw new Error('Method not implemented.');
  }

  async rejectRequest(id: string): Promise<void> {
    delete this.#requests[id];
    // TODO: notify extension
  }

  #getWalletByAddress(address: string): Wallet | undefined {
    return Object.values(this.#wallets).find(
      (wallet) =>
        wallet.account.address.toLowerCase() === address.toLowerCase(),
    );
  }

  #generatePrivateKey(): {
    privateKey: string;
    address: string;
  } {
    // eslint-disable-next-line no-restricted-globals
    const pk = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
    const address = Address.fromPrivateKey(pk).toString();
    return { privateKey: pk.toString('hex'), address };
  }
}
