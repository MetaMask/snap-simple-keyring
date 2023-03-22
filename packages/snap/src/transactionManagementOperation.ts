import { TransactionFactory, TypedTransaction } from '@ethereumjs/tx';
import type { TxData } from '@ethereumjs/tx';
import { personalSign, recoverPersonalSignature } from '@metamask/eth-sig-util';

import { getPrivateKeyByAddress } from './accountManagement';
import { hexToArrayBuffer } from './utils';

export enum TransactionOperation {
  SignTransaction = 'signTransaction',
  SignMessage = 'signMessage',
  SignPersonalMessage = 'signPersonalMessage',
}

/**
 *
 * @param ethTx
 */
export async function signTransaction(
  from: string,
  ethTx: TypedTransaction,
): Promise<TxData> {
  const privateKey = await getPrivateKeyByAddress(from);
  const privateKeyBuffer = hexToArrayBuffer(privateKey);

  const tx = TransactionFactory.fromTxData(ethTx);
  // @ts-ignore
  const signedTx = tx.sign(privateKeyBuffer);

  return signedTx;
}

export async function signPersonalMessage(
  from: string,
  hexMessage: string,
): Promise<string> {
  const privateKey = await getPrivateKeyByAddress(from);
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = hexToArrayBuffer(privateKey); //Buffer.from(privateKey, 'hex');

  // eslint-disable-next-line no-restricted-globals
  const messageBuffer = hexToArrayBuffer(hexMessage);
  const signedMessageHex = personalSign({
    // @ts-ignore
    privateKey: privateKeyBuffer,
    // @ts-ignore
    data: messageBuffer,
  });

  const recoveredAddress = recoverPersonalSignature({
    // @ts-ignore
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
