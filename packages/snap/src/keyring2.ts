/* eslint-disable no-restricted-globals */
/* eslint-disable jsdoc/require-param-description */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line import/no-extraneous-dependencies
import Common from '@ethereumjs/common';
import { JsonTx, TransactionFactory, TypedTransaction } from '@ethereumjs/tx';
import { Address } from '@ethereumjs/util';
import {
  SignTypedDataVersion,
  TypedDataV1,
  TypedMessage,
  personalSign,
  recoverPersonalSignature,
  signTypedData as signTypedDataFunction,
} from '@metamask/eth-sig-util';
import { Json } from '@metamask/snaps-types';
import { v4 as uuid } from 'uuid';

import { KeyringState, SerializedKeyringState } from '.';
import { getState, saveState } from './stateManagement';

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
  listAccounts(): Promise<KeyringAccount[]>;
  getAccount(id: string): Promise<KeyringAccount | undefined>;
  createAccount(
    name: string,
    chains: string[],
    options?: Record<string, Json>,
  ): Promise<KeyringAccount>;
  updateAccount(account: KeyringAccount): Promise<void>;
  deleteAccount(id: string): Promise<void>;
  exportAccount(id: string): Promise<Record<string, Json>>;
  listRequests(): Promise<KeyringRequest[]>;
  getRequest(id: string): Promise<KeyringRequest>;
  submitRequest(request: KeyringRequest): Promise<void>;
  approveRequest(id: string): Promise<void>;
  rejectRequest(id: string): Promise<void>;
};

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
    return this.#wallets[id]?.account;
  }

  async createAccount(
    name: string,
    chains: string[],
    options?: Record<string, Json> | undefined,
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
    // TODO: register account with the KeyringController

    return account;
  }

  async updateAccount(account: KeyringAccount): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteAccount(id: string): Promise<void> {
    // TODO: update the KeyringController
    delete this.#wallets[id];
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
    delete this.#requests[id];
  }

  #generatePrivateKey(): {
    privateKey: string;
    address: string;
  } {
    const pk = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
    const address = Address.fromPrivateKey(pk).toString();
    return { privateKey: pk.toString('hex'), address };
  }

  // #accounts: Record<string, Account>;
  // #pendingRequests: Record<string, any>;
  // constructor(state: KeyringState) {
  //   this.#accounts = state.accounts;
  //   this.#pendingRequests = state.pendingRequests;
  // }
  // async persistKeyring(): Promise<void> {
  //   await saveState({
  //     accounts: this.#accounts,
  //     pendingRequests: this.#pendingRequests,
  //   });
  // }
  // serialize(): SerializedKeyringState {
  //   return {
  //     accounts: Object.keys(this.#accounts),
  //     pendingRequests: this.#pendingRequests,
  //   };
  // }
  // async deserialize(
  //   serializedKeyringState: SerializedKeyringState,
  // ): Promise<void> {
  //   const { accounts, pendingRequests } = serializedKeyringState;
  //   this.#accounts = accounts.reduce(
  //     (acc, caip10Account) => ({
  //       ...acc,
  //       [caip10Account]: caip10Account,
  //     }),
  //     {},
  //   );
  //   this.#pendingRequests = pendingRequests;
  // }
  // /**
  //  * Handle request to sign a transaction or message.
  //  *
  //  * @param request - Signature request.
  //  */
  // async handleSubmitRequest(request: any) {
  //   const { params: signatureRequest } = request;
  //   const { id } = signatureRequest;
  //   this.#pendingRequests[id] = signatureRequest;
  //   await this.persistKeyring();
  // }
  // /**
  //  * Handle request to set snap state.
  //  *
  //  * @param request - Set state request.
  //  * @param request.params
  //  * @param request.params.state
  //  */
  // async handleSetState(request: {
  //   params: {
  //     state: KeyringState;
  //   };
  // }) {
  //   const { state } = request.params;
  //   this.#accounts = state.accounts;
  //   this.#pendingRequests = state.pendingRequests;
  //   await this.persistKeyring();
  //   console.log('snap_keyring_state set', state);
  // }
  // /**
  //  * Handle request to get snap state.
  //  *
  //  * @returns Promise of the snap state.
  //  */
  // async handleGetState(): Promise<any> {
  //   const state = await getState();
  //   console.log('snap_keyring_state get', state);
  //   return state;
  // }
  // /**
  //  * Handle request to approve a signature request.
  //  *
  //  * @param payload - Parameter to forward to the SnapController.
  //  */
  // async handleApproveRequest(payload: any) {
  //   console.log('in handleApproveRequest', JSON.stringify(payload));
  //   const { id: requestId } = payload;
  //   const state = await getState();
  //   const pendingRequest = state.pendingRequests[requestId];
  //   let data, address, chainOpts, method;
  //   if (pendingRequest) {
  //     [data, address, chainOpts] = pendingRequest.params;
  //     method = pendingRequest.method;
  //   } else {
  //     [address, data, chainOpts] = payload.params;
  //     method = payload.method;
  //   }
  //   console.log('payload', address, data, chainOpts);
  //   switch (method) {
  //     case 'personal_sign': {
  //       return await this.#signPersonalMessage(address, data);
  //     }
  //     case 'eth_sendTransaction': {
  //       return await this.#signTransaction(address, data, chainOpts);
  //     }
  //     case 'eth_signTransaction': {
  //       return await this.#signTransaction(address, data, chainOpts);
  //     }
  //     case 'eth_signTypedData': {
  //       return await this.#signTypedData(address, data, chainOpts);
  //     }
  //     default:
  //       throw new Error('Invalid Approval Method.');
  //   }
  // }
  // async #getAccountByAddress(address: string): Promise<Account | undefined> {
  //   return Object.values(this.#accounts).find(
  //     (account) => account.address.toLowerCase() === address.toLowerCase(),
  //   );
  // }
  // async #getPrivateKeyByAddress(address: string): Promise<Buffer | undefined> {
  //   const account = this.#getAccountByAddress(address);
  //   if (account === undefined) {
  //     return undefined;
  //   }
  //   return Buffer.from(account.privateKey, 'hex');
  // }
  // // remove when new snaps util is released
  // // eslint-disable-next-line jsdoc/require-jsdoc
  // isCaipAccount(caip10Account: string): caip10Account is string {
  //   return (
  //     typeof caip10Account === 'string' &&
  //     /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32}):(?<address>[-.%a-zA-Z0-9]{1,128})$/u.test(
  //       caip10Account,
  //     )
  //   );
  // }
  // #buildTxToSign(tx: any, opts: any): TypedTransaction {
  //   if (opts) {
  //     return TransactionFactory.fromTxData(
  //       { ...tx, type: opts.type },
  //       {
  //         common: Common.custom(
  //           { chainId: opts.chainId },
  //           { hardfork: opts.hardfork },
  //         ),
  //       },
  //     );
  //   }
  //   return TransactionFactory.fromTxData(tx);
  // }
  // async #signTransaction(
  //   from: string,
  //   ethTx: any,
  //   chainOpts: any,
  // ): Promise<JsonTx> {
  //   const account = await this.#getAccountByAddress(from);
  //   if (account === undefined) {
  //     throw new Error(`Cannot find account for address: ${from}`);
  //   }
  //   console.log('privateKey', account.privateKey);
  //   // eslint-disable-next-line no-restricted-globals
  //   const privateKeyBuffer = Buffer.from(account.privateKey, 'hex');
  //   console.log('chainOpts', chainOpts);
  //   const signedTx = this.#buildTxToSign(ethTx, chainOpts).sign(
  //     privateKeyBuffer,
  //   );
  //   const serializableSignedTx = this.#serializeTransaction(
  //     signedTx.toJSON(),
  //     chainOpts,
  //   );
  //   return serializableSignedTx;
  // }
  // async #signPersonalMessage(from: string, request: string): Promise<string> {
  //   const account = await this.#getAccountByAddress(from);
  //   if (account === undefined) {
  //     throw new Error(`Cannot find account for address: ${from}`);
  //   }
  //   // eslint-disable-next-line no-restricted-globals
  //   const privateKeyBuffer = Buffer.from(account.privateKey, 'hex');
  //   // eslint-disable-next-line no-restricted-globals
  //   const messageBuffer = Buffer.from(request.slice(2), 'hex');
  //   const signedMessageHex = personalSign({
  //     privateKey: privateKeyBuffer,
  //     data: messageBuffer,
  //   });
  //   const recoveredAddress = recoverPersonalSignature({
  //     data: messageBuffer,
  //     signature: signedMessageHex,
  //   });
  //   if (recoveredAddress !== from) {
  //     throw new Error(
  //       `Signature verification failed for account "${from}" (got "${recoveredAddress}")`,
  //     );
  //   }
  //   return signedMessageHex;
  // }
  // async #signTypedData(
  //   from: string,
  //   typedData: Record<string, unknown>[],
  //   opts: { version?: SignTypedDataVersion },
  // ): Promise<string> {
  //   let version: SignTypedDataVersion;
  //   if (
  //     opts.version &&
  //     Object.keys(SignTypedDataVersion).includes(opts.version as string)
  //   ) {
  //     version = opts.version;
  //   } else {
  //     // Treat invalid versions as "V1"
  //     version = SignTypedDataVersion.V1;
  //   }
  //   const privateKey = await this.#getPrivateKeyByAddress(from);
  //   // eslint-disable-next-line no-restricted-globals
  //   const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  //   return signTypedDataFunction({
  //     privateKey: privateKeyBuffer,
  //     data: typedData as unknown as TypedDataV1 | TypedMessage<any>,
  //     version,
  //   });
  // }
  // #serializeTransaction(
  //   tx: JsonTx,
  //   chainOpts: { type: number; chain: number; hardfork: string },
  // ): Record<string, any> {
  //   const serializableSignedTx: Record<string, any> = {
  //     ...tx,
  //     type: chainOpts.type,
  //   };
  //   // Make tx serializable
  //   // toJSON does not remove undefined or convert undefined to null
  //   Object.entries(serializableSignedTx).forEach(([key, _]) => {
  //     if (serializableSignedTx[key] === undefined) {
  //       delete serializableSignedTx[key];
  //     }
  //   });
  //   return serializableSignedTx;
  // }
  // async #generatePrivateKey(): Promise<{
  //   // eslint-disable-next-line no-restricted-globals
  //   privateKey: Buffer;
  //   address: string;
  // }> {
  //   // eslint-disable-next-line no-restricted-globals
  //   const privateKey = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
  //   const address = Address.fromPrivateKey(privateKey).toString();
  //   return { privateKey, address };
  // }
  // async handleCreateAccount({
  //   name,
  //   chains,
  //   options,
  // }: {
  //   name: string;
  //   chains: string[];
  //   options?: Json;
  // }) {
  //   const { privateKey, address } = await this.#generatePrivateKey();
  //   const account: KeyringAccount = {
  //     id: uuid(),
  //     name,
  //     address,
  //     chains,
  //     capabilities: ['sign'],
  //     type: 'eip155:eoa',
  //   };
  //   console.log(options);
  //   console.log(account);
  //   console.log(privateKey);
  // }
}
