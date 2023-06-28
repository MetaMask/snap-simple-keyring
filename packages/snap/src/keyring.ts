import { Common, Hardfork } from '@ethereumjs/common';
import { JsonTx, TransactionFactory } from '@ethereumjs/tx';
import {
  Address,
  ecsign,
  stripHexPrefix,
  toBuffer,
  toChecksumAddress,
} from '@ethereumjs/util';
import {
  SignTypedDataVersion,
  TypedDataV1,
  TypedMessage,
  concatSig,
  personalSign,
  recoverPersonalSignature,
  signTypedData,
} from '@metamask/eth-sig-util';
import {
  Keyring,
  KeyringAccount,
  KeyringRequest,
  SubmitRequestResponse,
} from '@metamask/keyring-api';
import type { Json, JsonRpcRequest } from '@metamask/utils';
import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';

import { SigningMethods } from './permissions';
import { saveState } from './stateManagement';
import { isEvmChain, serializeTransaction, isUniqueAccountName } from './util';

export type KeyringState = {
  wallets: Record<string, Wallet>;
  requests: Record<string, KeyringRequest>;
};

export type Wallet = {
  account: KeyringAccount;
  privateKey: string;
};

export class SimpleKeyring implements Keyring {
  #wallets: Record<string, Wallet>;

  #requests: Record<string, KeyringRequest>;

  constructor(state: KeyringState) {
    this.#wallets = state.wallets;
    this.#requests = state.requests;
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

    if (!isUniqueAccountName(name, Object.values(this.#wallets))) {
      throw new Error(`Account name already in use: ${name}`);
    }

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
    await this.#saveState();

    await snap.request({
      method: 'snap_manageAccounts',
      params: {
        method: 'createAccount',
        params: { account },
      },
    });
    return account;
  }

  async filterAccountChains(_id: string, chains: string[]): Promise<string[]> {
    // The `id` argument is not used because all accounts created by this snap
    // are expected to be compatible with any EVM chain.
    return chains.filter((chain) => isEvmChain(chain));
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

    if (!isUniqueAccountName(account.name, Object.values(this.#wallets))) {
      throw new Error(`Account name already in use: ${account.name}`);
    }

    this.#wallets[account.id].account = newAccount;
    await this.#saveState();

    await snap.request({
      method: 'snap_manageAccounts',
      params: {
        method: 'updateAccount',
        params: { account },
      },
    });
  }

  async deleteAccount(id: string): Promise<void> {
    delete this.#wallets[id];
    await this.#saveState();

    await snap.request({
      method: 'snap_manageAccounts',
      params: {
        method: 'deleteAccount',
        params: { id },
      },
    });
  }

  async listRequests(): Promise<KeyringRequest[]> {
    return Object.values(this.#requests);
  }

  async getRequest(id: string): Promise<KeyringRequest> {
    return this.#requests[id];
  }

  // This snap implements a synchronous keyring, which means that the request
  // doesn't need to be approved and the execution result will be returned to
  // the caller by the `submitRequest` method.
  //
  // In an asynchronous implementation, the request should be stored in queue
  // of pending requests to be approved or rejected by the user.
  async submitRequest(request: KeyringRequest): Promise<SubmitRequestResponse> {
    const { method, params = '' } = request.request as JsonRpcRequest;
    const signature = this.#handleSigningRequest(method, params);
    return {
      pending: false,
      result: signature,
    };
  }

  async approveRequest(_id: string): Promise<void> {
    throw new Error(
      'The "approveRequest" method is not available on this snap.',
    );
  }

  async rejectRequest(_id: string): Promise<void> {
    throw new Error(
      'The "rejectRequest" method is not available on this snap.',
    );
  }

  #getWalletByAddress(address: string): Wallet {
    const walletMatch = Object.values(this.#wallets).find(
      (wallet) =>
        wallet.account.address.toLowerCase() === address.toLowerCase(),
    );

    if (walletMatch === undefined) {
      throw new Error(`Cannot find wallet for address: ${address}`);
    }
    return walletMatch;
  }

  #generateKeyPair(): {
    privateKey: string;
    address: string;
  } {
    // eslint-disable-next-line no-restricted-globals
    const pk = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
    const address = toChecksumAddress(Address.fromPrivateKey(pk).toString());
    return { privateKey: pk.toString('hex'), address };
  }

  #handleSigningRequest(method: string, params: Json): Json {
    switch (method) {
      case 'personal_sign': {
        const [from, message] = params as string[];
        return this.#signPersonalMessage(from, message);
      }

      case 'eth_sendTransaction':
      case 'eth_signTransaction':
      case SigningMethods.SignTransaction: {
        const [from, tx, opts] = params as [string, JsonTx, Json];
        return this.#signTransaction(from, tx, opts);
      }

      case 'eth_signTypedData':
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData_v2':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4': {
        const [from, data, opts] = params as [
          string,
          Json,
          { version: SignTypedDataVersion },
        ];
        return this.#signTypedData(from, data, opts);
      }

      case 'eth_sign': {
        const [from, data] = params as [string, string];
        return this.#signMessage(from, data);
      }

      default: {
        throw new Error(`EVM method not supported: ${method}`);
      }
    }
  }

  #signTransaction(from: string, tx: any, _opts: any): Json {
    // Patch the transaction to make sure that the `chainId` is a hex string.
    if (!tx.chainId.startsWith('0x')) {
      tx.chainId = `0x${parseInt(tx.chainId, 10).toString(16)}`;
    }

    const wallet = this.#getWalletByAddress(from);
    const privateKey = Buffer.from(wallet.privateKey, 'hex');
    const common = Common.custom(
      { chainId: tx.chainId },
      {
        hardfork:
          tx.maxPriorityFeePerGas || tx.maxFeePerGas
            ? Hardfork.London
            : Hardfork.Istanbul,
      },
    );

    const signedTx = TransactionFactory.fromTxData(tx, {
      common,
    }).sign(privateKey);

    return serializeTransaction(signedTx.toJSON(), signedTx.type);
  }

  #signTypedData(
    from: string,
    data: Json,
    opts: { version: SignTypedDataVersion } = {
      version: SignTypedDataVersion.V1,
    },
  ): string {
    const { privateKey } = this.#getWalletByAddress(from);
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

    return signTypedData({
      privateKey: privateKeyBuffer,
      data: data as unknown as TypedDataV1 | TypedMessage<any>,
      version: opts.version,
    });
  }

  #signPersonalMessage(from: string, request: string): string {
    const { privateKey } = this.#getWalletByAddress(from);
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const messageBuffer = Buffer.from(request.slice(2), 'hex');

    const signature = personalSign({
      privateKey: privateKeyBuffer,
      data: messageBuffer,
    });

    const recoveredAddress = recoverPersonalSignature({
      data: messageBuffer,
      signature,
    });
    if (recoveredAddress !== from) {
      throw new Error(
        `Signature verification failed for account "${from}" (got "${recoveredAddress}")`,
      );
    }

    return signature;
  }

  #signMessage(from: string, data: string): string {
    const { privateKey } = this.#getWalletByAddress(from);
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const message = stripHexPrefix(data);
    const signature = ecsign(Buffer.from(message, 'hex'), privateKeyBuffer);
    return concatSig(toBuffer(signature.v), signature.r, signature.s);
  }

  async #saveState(): Promise<void> {
    await saveState({
      wallets: this.#wallets,
      requests: this.#requests,
    });
  }
}
