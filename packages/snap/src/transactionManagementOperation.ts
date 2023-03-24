import { TransactionFactory, TypedTransaction } from '@ethereumjs/tx';
import type { TxData } from '@ethereumjs/tx';
import { personalSign, recoverPersonalSignature } from '@metamask/eth-sig-util';

import { getPrivateKeyByAddress } from './accountManagement';

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
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  throw new Error();
  // const tx = TransactionFactory.fromTxData(ethTx);
  // const signedTx = tx.sign(privateKeyBuffer);

  // return signedTx;
}

export async function signPersonalMessage(
  from: string,
  request: string,
): Promise<string> {
  // const privateKey = await getPrivateKeyByAddress(from);
  const privateKey =
    'b7d8cef9f7d0e5f8d29dd714c32b112fae6295b41d15165272ea86c966cb4cd3';
  console.log('privateKEy', privateKey);
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  const hexMessage = request['params'][0];

  // eslint-disable-next-line no-restricted-globals
  const messageBuffer = Buffer.from(hexMessage.slice(2), 'hex');

  console.log('priavtekey buffer', privateKeyBuffer);
  const signedMessageHex = personalSign({
    privateKey: privateKeyBuffer,
    data: messageBuffer,
  });

  console.log(222, signedMessageHex);

  const recoveredAddress = recoverPersonalSignature({
    data: messageBuffer,
    signature: signedMessageHex,
  });
  if (recoveredAddress !== from) {
    throw new Error(
      `Signature verification failed for account "${from}" (got "${recoveredAddress}")`,
    );
  }

  console.log('done signing', signedMessageHex);

  return signedMessageHex;
}
