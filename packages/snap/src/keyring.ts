/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line import/no-extraneous-dependencies
import Common, { Hardfork } from '@ethereumjs/common';
import { JsonTx, TransactionFactory } from '@ethereumjs/tx';
import { Address } from '@ethereumjs/util';
import {
  SignTypedDataVersion,
  TypedDataV1,
  TypedMessage,
  personalSign,
  recoverPersonalSignature,
  signTypedData as signTypedDataFunction,
} from '@metamask/eth-sig-util';

import { KeyringState, SerializedKeyringState } from '.';
import { getState, saveState } from './stateManagement';

export type Account = {
  caip10Account: string;
  address: string;
  privateKey: string;
};

export class SimpleKeyringSnap {
  #accounts: Record<string, string>;

  #pendingRequests: Record<string, any>;

  constructor(state: KeyringState) {
    this.#accounts = state.accounts;
    this.#pendingRequests = state.pendingRequests;
  }

  async persistKeyring(): Promise<void> {
    await saveState({
      accounts: this.#accounts,
      pendingRequests: this.#pendingRequests,
    });
  }

  serialize(): SerializedKeyringState {
    return {
      accounts: Object.keys(this.#accounts),
      pendingRequests: this.#pendingRequests,
    };
  }

  async deserialize(
    serializedKeyringState: SerializedKeyringState,
  ): Promise<void> {
    const { accounts, pendingRequests } = serializedKeyringState;
    this.#accounts = accounts.reduce(
      (acc, caip10Account) => ({
        ...acc,
        [caip10Account]: caip10Account,
      }),
      {},
    );
    this.#pendingRequests = pendingRequests;
  }

  /**
   * Handle request to sign a transaction or message.
   *
   * @param request - Signature request.
   */
  /**
   *
   * @param request
   */
  async handleSubmitRequest(request: any) {
    const { params: signatureRequest } = request;
    const { id } = signatureRequest;
    this.#pendingRequests[id] = signatureRequest;
    await this.persistKeyring();
  }

  /**
   * Handle request to set snap state.
   *
   * @param request - Set state request.
   * @param request.params
   * @param request.params.state
   */
  async handleSetState(request: {
    params: {
      state: KeyringState;
    };
  }) {
    const { state } = request.params;

    this.#accounts = state.accounts;
    this.#pendingRequests = state.pendingRequests;

    await this.persistKeyring();
    console.log('snap_keyring_state set', state);
  }

  /**
   * Handle request to get snap state.
   *
   * @returns Promise of the snap state.
   */
  async handleGetState(): Promise<any> {
    const state = await getState();
    console.log('snap_keyring_state get', state);
    return state;
  }

  /**
   * Handle request to manage accounts.
   *
   * This function is a pass-through between the snap UI and the SnapController.
   *
   * @param params - Parameter to the manageAccounts method.
   * @returns Pass-through response from the SnapController.
   */
  async handleManageAccounts(params: any) {
    console.log('[Snap] handleManageAccounts', params);
    const [method] = params;

    switch (method) {
      case 'create': {
        const account = await this.#createAccount();
        return await snap.request({
          method: 'snap_manageAccounts',
          params: ['create', account.address],
        });
      }
      default:
        throw new Error('Invalid method.');
    }
  }

  /**
   * Handle request to approve a signature request.
   *
   * @param payload - Parameter to forward to the SnapController.
   */
  async handleApproveRequest(payload: any) {
    console.log('in handleApproveRequest', JSON.stringify(payload));
    const { id: requestId } = payload;

    const state = await getState();
    const pendingRequest = state.pendingRequests[requestId];
    let data, address, chainOpts, method;
    if (pendingRequest) {
      [data, address, chainOpts] = pendingRequest.params;
      method = pendingRequest.method;
    } else {
      [address, data, chainOpts] = payload.params;
      method = payload.method;
    }
    console.log('payload', address, data, chainOpts);
    console.log(JSON.stringify(payload));

    switch (method) {
      case 'personal_sign': {
        return await this.#signPersonalMessage(address, data);
      }
      case 'eth_sendTransaction': {
        return await this.#signTransaction(address, data, chainOpts);
      }
      case 'eth_signTransaction': {
        return await this.#signTransaction(address, data, chainOpts);
      }
      case 'eth_signTypedData': {
        return await this.#signTypedData(address, data, chainOpts);
      }
      default:
        throw new Error('Invalid Approval Method.');
    }
  }

  async #createAccount(privateKeyHex?: string): Promise<Account> {
    // eslint-disable-next-line no-restricted-globals
    let privateKeyBuffer: Buffer;
    if (privateKeyHex) {
      // eslint-disable-next-line no-restricted-globals
      privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
    } else {
      const privateKey = new Uint8Array(32);
      // eslint-disable-next-line no-restricted-globals
      privateKeyBuffer = Buffer.from(crypto.getRandomValues(privateKey));
    }
    const address = Address.fromPrivateKey(privateKeyBuffer).toString();
    const caip10Account = `eip155:1:${address}`;

    const account = {
      caip10Account,
      address: address.toLowerCase(),
      privateKey: privateKeyBuffer.toString('hex'),
    };
    console.log(account);

    if (this.#accounts[address]) {
      throw new Error('Account already exists');
    }

    this.#accounts[address] = account.privateKey;

    await this.persistKeyring();

    return account;
  }

  async #getPrivateKeyByAddress(address: string): Promise<string> {
    const currentState = await getState();

    let privateKey;
    if (this.isCaipAccount(address)) {
      const [, , extractedAddress] = address.split(':');
      privateKey = currentState.accounts[extractedAddress];
    } else {
      privateKey = currentState.accounts[address];
    }

    if (!privateKey) {
      throw new Error('Unknown address');
    }

    return privateKey;
  }

  // remove when new snaps util is released
  // eslint-disable-next-line jsdoc/require-jsdoc
  isCaipAccount(caip10Account: string): caip10Account is string {
    return (
      typeof caip10Account === 'string' &&
      /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32}):(?<address>[-.%a-zA-Z0-9]{1,128})$/u.test(
        caip10Account,
      )
    );
  }

  async #signTransaction(
    from: string,
    ethTx: any,
    chainOpts: any,
  ): Promise<JsonTx> {
    const privateKey = await this.#getPrivateKeyByAddress(from.toLowerCase());
    console.log('privateKey', privateKey);
    // eslint-disable-next-line no-restricted-globals
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

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
    }).sign(privateKeyBuffer);

    const serializableSignedTx = this.#serializeTransaction(
      signedTx.toJSON(),
      signedTx.type,
    );

    return serializableSignedTx;
  }

  async #signPersonalMessage(from: string, request: string): Promise<string> {
    const privateKey = await this.#getPrivateKeyByAddress(from);
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
      throw new Error(
        `Signature verification failed for account "${from}" (got "${recoveredAddress}")`,
      );
    }

    return signedMessageHex;
  }

  async #signTypedData(
    from: string,
    typedData: Record<string, unknown>[],
    opts: { version?: SignTypedDataVersion },
  ): Promise<string> {
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

    const privateKey = await this.#getPrivateKeyByAddress(from);
    // eslint-disable-next-line no-restricted-globals
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

    return signTypedDataFunction({
      privateKey: privateKeyBuffer,
      data: typedData as unknown as TypedDataV1 | TypedMessage<any>,
      version,
    });
  }

  #serializeTransaction(tx: JsonTx, type: number): Record<string, any> {
    const serializableSignedTx: Record<string, any> = {
      ...tx,
      type,
    };
    // Make tx serializable
    // toJSON does not remove undefined or convert undefined to null
    Object.entries(serializableSignedTx).forEach(([key, _]) => {
      if (serializableSignedTx[key] === undefined) {
        delete serializableSignedTx[key];
      }
    });

    return serializableSignedTx;
  }
}
