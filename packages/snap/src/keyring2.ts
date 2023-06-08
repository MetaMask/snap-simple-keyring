import { Address } from '@ethereumjs/util';
import {
  Keyring,
  KeyringAccount,
  KeyringRequest,
  SubmitRequestResponse,
} from '@metamask/keyring-api';
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
    options: Record<string, Json> | null = null,
  ): Promise<KeyringAccount> {
    const { privateKey, address } = this.#generateKeyPair();
    const account: KeyringAccount = {
      id: uuid(),
      name,
      options,
      address,
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData_v1',
        'eth_signTypedData_v2',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'eth_signTypedData',
        'personal_sign',
      ],
      type: 'eip155:eoa',
    };

    this.#wallets[account.id] = { account, privateKey };
    console.log(
      `[SNAP] Sending createAccount request to the SnapController...`,
    );
    await snap.request({
      method: 'snap_manageAccounts',
      params: ['create', account.address],
    });

    return account;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async filterSupportedChains(id: string, chains: string[]): Promise<string[]> {
    return chains;
  }

  async updateAccount(account: KeyringAccount): Promise<void> {
    const currentAccount = this.#wallets[account.id].account;
    const newAccount: KeyringAccount = {
      ...currentAccount,
      ...account,
      // Restore read-only properties.
      address: currentAccount.address,
      supportedMethods: currentAccount.supportedMethods,
      type: currentAccount.type,
      options: currentAccount.options,
    };

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

  async submitRequest<Result extends Json = null>(
    request: KeyringRequest,
  ): Promise<SubmitRequestResponse<Result>> {
    this.#requests[request.request.id] = request;
    return { pending: true };
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

  #generateKeyPair(): {
    privateKey: string;
    address: string;
  } {
    // eslint-disable-next-line no-restricted-globals
    const pk = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
    const address = Address.fromPrivateKey(pk).toString();
    return { privateKey: pk.toString('hex'), address };
  }
}
