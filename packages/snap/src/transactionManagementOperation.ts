/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line import/no-extraneous-dependencies
import Common from '@ethereumjs/common';
import { JsonTx, TransactionFactory } from '@ethereumjs/tx';
import {
  SignTypedDataVersion,
  TypedDataV1,
  TypedMessage,
  personalSign,
  recoverPersonalSignature,
  signTypedData as signTypedDataFunction,
} from '@metamask/eth-sig-util';

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

export async function signTypedData(
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

  const privateKey = await getPrivateKeyByAddress(from);
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  return signTypedDataFunction({
    privateKey: privateKeyBuffer,
    data: typedData as unknown as TypedDataV1 | TypedMessage<any>,
    version,
  });
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
