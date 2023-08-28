import { JsonTx } from '@ethereumjs/tx';
import type { Json } from '@metamask/utils';

import { Wallet } from './keyring';
import {
  InternalMethod,
  RequestMethods,
  SnapKeyringMethod,
} from './permissions';

/**
 * Logs a request with the specified request method and payload.
 *
 * @param requestMethod - The request method.
 * @param payload - The payload of the request.
 */
export function logRequest(
  requestMethod: SnapKeyringMethod | RequestMethods | InternalMethod,
  payload: any,
): void {
  console.log(`[Snap] ${requestMethod} Payload: ${JSON.stringify(payload)}`);
}

/**
 * Serializes a transaction by removing undefined properties and converting them to null.
 *
 * @param tx - The transaction object.
 * @param type - The type of the transaction.
 * @returns The serialized transaction.
 */
export function serializeTransaction(tx: JsonTx, type: number): Json {
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

/**
 * Validates whether there are no duplicate names in the provided array of wallets.
 *
 * @param name - The name to validate for duplication.
 * @param wallets - The array of wallets to search for duplicate names.
 * @returns Returns true if no duplicate names are found, otherwise false.
 */
export function isUniqueAccountName(name: string, wallets: Wallet[]): boolean {
  return !wallets.find((wallet) => wallet.account.name === name);
}

/**
 * Validates whether there are no duplicate addresses in the provided array of wallets.
 *
 * @param address - The address to validate for duplication.
 * @param wallets - The array of wallets to search for duplicate addresses.
 * @returns Returns true if no duplicate addresses are found, otherwise false.
 */
export function isUniqueAddress(address: string, wallets: Wallet[]): boolean {
  return !wallets.find((wallet) => wallet.account.address === address);
}

/**
 * Determines whether the given CAIP-2 chain ID represents an EVM-based chain.
 *
 * @param caip2ChainId - The CAIP-2 chain ID to check.
 * @returns Returns true if the chain is EVM-based, otherwise false.
 */
export function isEvmChain(caip2ChainId: string): boolean {
  return caip2ChainId.startsWith('eip155:');
}
