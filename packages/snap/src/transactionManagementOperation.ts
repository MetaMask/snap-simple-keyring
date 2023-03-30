import { TransactionFactory } from '@ethereumjs/tx';
import type { TxData } from '@ethereumjs/tx';
import { personalSign, recoverPersonalSignature } from '@metamask/eth-sig-util';

import { getPrivateKeyByAddress } from './accountManagement';

export async function signTransaction(from: string, ethTx: any) {
  const privateKey = await getPrivateKeyByAddress(from.toLowerCase());
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  const signedTx = TransactionFactory.fromTxData(ethTx).sign(privateKeyBuffer);
  console.log(signedTx);

  const serializableSignedTx = signedTx.toJSON() as TxData;

  return serializableSignedTx;
}

export async function signPersonalMessage(
  from: string,
  request: string,
): Promise<string> {
  const privateKey = await getPrivateKeyByAddress(from);
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  // eslint-disable-next-line no-restricted-globals
  const messageBuffer = Buffer.from(request.slice(2), 'hex');

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

  return signedMessageHex;
}
