/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line import/no-extraneous-dependencies
import Common from '@ethereumjs/common';
import { JsonTx, TransactionFactory } from '@ethereumjs/tx';
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

  const common = Common.custom(
    { chainId: chainOpts.chainId },
    { hardfork: chainOpts.hardfork },
  );

  const signedTx = TransactionFactory.fromTxData(
    { ...ethTx, type: chainOpts.type },
    {
      common,
    },
  ).sign(privateKeyBuffer);

  const serializableSignedTx = serializeTransaction(
    signedTx.toJSON(),
    chainOpts,
  );

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

function serializeTransaction(
  tx: JsonTx,
  chainOpts: { type: number; chain: number; hardfork: string },
): Record<string, any> {
  const serializableSignedTx: Record<string, any> = {
    ...tx,
    type: chainOpts.type,
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
