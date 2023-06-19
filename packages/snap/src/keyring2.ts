import Common, { Hardfork } from '@ethereumjs/common';
import { JsonTx, TransactionFactory } from '@ethereumjs/tx';
import { Address } from '@ethereumjs/util';
import {
  SignTypedDataVersion,
  TypedDataV1,
  TypedMessage,
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
import { v4 as uuid } from 'uuid';

import { SigningMethods } from './permissions';
import { saveState } from './stateManagement';
import {
  isEVMChain,
  serializeTransaction,
  validateNoDuplicateNames,
} from './util';

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
    console.log('[Snap] listAccounts', this.#wallets);
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
      `[Snap] Sending createAccount request to the SnapController...`,
    );
    await snap.request({
      method: 'snap_manageAccounts',
      params: ['create', account.address],
    });

    await this.#saveState();

    return account;
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

    if (!validateNoDuplicateNames(account.name, Object.values(this.#wallets))) {
      throw new Error(`[Snap] Duplication name for wallet: ${account.name}`);
    }
    // TODO: update the KeyringController
    this.#wallets[account.id].account = newAccount;
    await this.#saveState();
  }

  async deleteAccount(id: string): Promise<void> {
    // TODO: update the KeyringController
    delete this.#wallets[id];
    await this.#saveState();
  }

  async exportAccount(id: string): Promise<Record<string, Json>> {
    return {
      privateKey: this.#wallets[id].privateKey,
    };
  }

  async #saveState(): Promise<void> {
    console.log('saving keyring');
    console.log(this.#wallets);
    console.log(this.#requests);
    await saveState({
      wallets: this.#wallets,
      requests: this.#requests,
    });
  }

  async listRequests(): Promise<KeyringRequest[]> {
    return Object.values(this.#requests);
  }

  async getRequest(id: string): Promise<KeyringRequest> {
    return this.#requests[id];
  }

  /**
   * Submit a request to be processed by the keyring.
   *
   * This implementation is synchronous, which means that the request doesn't
   * need to be approved and the execution result will be returned to the
   * caller.
   *
   * In an asynchronous implementation, the request should be stored in queue
   * of pending requests to be approved or rejected by the user.
   *
   * @param request - The submitted request.
   * @returns A promise that resolves to the execution result.
   */
  async submitRequest<Result extends Json = null>(
    request: KeyringRequest,
  ): Promise<SubmitRequestResponse> {
    const { method, params = '' } = request.request as JsonRpcRequest;
    const signedPayload = this.#handleSigningRequest(
      method as SigningMethods,
      params,
    );

    return {
      pending: false,
      result: signedPayload as Result,
    };
  }

  async approveRequest(_id: string): Promise<void> {
    // Example of approve an async pending request.
    //
    // const request = this.#requests[id];
    // const confirmation = await snap.request({
    //   method: 'snap_dialog',
    //   params: {
    //     type: 'confirmation',
    //     content: panel([
    //       heading(`Signing Request: ${request.request.method}`),
    //       text(`Would you like to sign this request?`),
    //       ...Object.entries((request.request as JsonRpcRequest).params).map(
    //         ([key, value]) => {
    //           return text(`${key}: ${JSON.stringify(value)}`);
    //         },
    //       ),
    //     ]),
    //   },
    // });

    // if (!confirmation) {
    //   throw new Error(
    //     `[Snap] User rejected signing request: ${request.request.method}`,
    //   );
    // }

    // // sign request
    // const result = this.#handleSigningRequest(
    //   request.request.method as SigningMethods,
    //   (request.request as JsonRpcRequest).params,
    // );

    // // notify extension
    // const payload = {
    //   id: request.request.id,
    //   result,
    // };
    // await snap.request({
    //   method: 'snap_manageAccounts',
    //   params: ['submit', payload],
    // });

    throw new Error('[Snap] Signing already done in submit request.');
  }

  async rejectRequest(_id: string): Promise<void> {
    // await snap.request({
    //   method: 'snap_manageAccounts',
    //   params: ['submit', payload],
    // });
    // delete this.#requests[id];

    throw new Error('[Snap] No reject request for this snap.');
  }

  async filterAccountChains(_id: string, chains: string[]): Promise<string[]> {
    // id is not used because all the accounts created by snap are EOA for evm chains
    // EOA can sign for any evm chain
    return chains.filter((chain) => isEVMChain(chain));
  }

  #getWalletByAddress(address: string): Wallet {
    const wallet = Object.values(this.#wallets).find(
      (keyringAccount) =>
        keyringAccount.account.address.toLowerCase() === address.toLowerCase(),
    );

    if (!wallet) {
      throw new Error(`[Snap] Cannot find wallet with address ${address}`);
    }

    return wallet;
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

  #handleSigningRequest(method: SigningMethods, params: Json): Json {
    switch (method) {
      case SigningMethods.EthSign: {
        throw new Error(`[Snap] Eth sign not implemented`);
      }
      case SigningMethods.SignPersonalMessage: {
        const [from, message] = params as string[];
        const signedMessage = this.#signPersonalMessage(from, message);
        return signedMessage;
      }
      case SigningMethods.SignTransaction: {
        const [from, ethTx, opts] = params as [string, JsonTx, Json];
        return this.#signTransaction(from, ethTx, opts);
      }
      case SigningMethods.SignTypedData: {
        const [from, typedData, opts] = params as [
          string,
          Json,
          { version: SignTypedDataVersion },
        ];
        return this.#signTypedData(from, typedData, opts);
      }
      default: {
        throw new Error(`[Snap] Unknwon method ${method as string}`);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  #signTransaction(from: string, ethTx: any, opts: any): Json {
    const wallet = this.#getWalletByAddress(from);

    // eslint-disable-next-line no-restricted-globals
    const privateKey = Buffer.from(wallet.privateKey, 'hex');

    const common = Common.custom(
      { chainId: ethTx.chainId },
      {
        hardfork:
          ethTx.maxPriorityFeePerGas || ethTx.maxFeePerGas
            ? Hardfork.London
            : Hardfork.Istanbul,
      },
    );

    const signedTx = TransactionFactory.fromTxData(ethTx, {
      common,
    }).sign(privateKey);

    const serializableSignedTx = serializeTransaction(
      signedTx.toJSON(),
      signedTx.type,
    );

    return serializableSignedTx;
  }

  #signTypedData(
    from: string,
    typedData: Json,
    opts: { version?: SignTypedDataVersion },
  ): string {
    let version: SignTypedDataVersion;
    if (
      opts.version &&
      Object.keys(SignTypedDataVersion).includes(opts.version as string)
    ) {
      version = opts.version;
    } else {
      // Treat invalid versions as "V1"
      version = SignTypedDataVersion.V1;
    }

    const { privateKey } = this.#getWalletByAddress(from);

    // eslint-disable-next-line no-restricted-globals
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

    return signTypedData({
      privateKey: privateKeyBuffer,
      data: typedData as unknown as TypedDataV1 | TypedMessage<any>,
      version,
    });
  }

  #signPersonalMessage(from: string, request: string): string {
    const { privateKey } = this.#getWalletByAddress(from);
    // eslint-disable-next-line no-restricted-globals
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

    // eslint-disable-next-line no-restricted-globals
    const messageBuffer = Buffer.from(request.slice(2), 'hex');

    const signedMessageHex = personalSign({
      privateKey: privateKeyBuffer,
      data: messageBuffer,
    });

    const recoveredAddress = recoverPersonalSignature({
      data: messageBuffer,
      signature: signedMessageHex,
    });
    if (recoveredAddress !== from) {
      console.log('incorrect address');
      throw new Error(
        `Signature verification failed for account "${from}" (got "${recoveredAddress}")`,
      );
    }

    return signedMessageHex;
  }
}
