/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line import/no-extraneous-dependencies
import Common from '@ethereumjs/common';
import { JsonTx, TransactionFactory, TxData } from '@ethereumjs/tx';
import { personalSign, recoverPersonalSignature } from '@metamask/eth-sig-util';

import { getPrivateKeyByAddress } from './accountManagement';

export async function signTransaction(
  from: string,
  ethTx: any,
  chainOpts: any,
): Promise<JsonTx> {
  const privateKey = await getPrivateKeyByAddress(from.toLowerCase());
  console.log('privateKey', privateKey);
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  console.log('chainOpts', chainOpts);

  const common = Common.custom({ ...chainOpts });

  const signedTx = TransactionFactory.fromTxData(ethTx, {
    common,
  }).sign(privateKeyBuffer);

  console.log('is signed?', signedTx.verifySignature());

  const serializableSignedTx = signedTx.toJSON();

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
