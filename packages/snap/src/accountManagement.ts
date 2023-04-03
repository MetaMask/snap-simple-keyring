import { Address } from '@ethereumjs/util';
import { KeyringState } from '.';
import { getState, saveState } from './stateManagement';

export type Account = {
  caip10Account: string;
  address: string;
  privateKey: string;
};

/**
 *
 */
export function createAccount(): Account {
  const privateKey = new Uint8Array(32);
  // eslint-disable-next-line no-restricted-globals
  const privateKeyBuffer = Buffer.from(crypto.getRandomValues(privateKey));
  const address = Address.fromPrivateKey(privateKeyBuffer).toString();
  const caip10Account = `eip155:1:${address}`;

  const account = {
    caip10Account,
    address: address.toLowerCase(),
    privateKey: privateKeyBuffer.toString('hex'),
  };
  console.log(account);
  return account;
}

export async function upsertAccount(account: Account): Promise<void> {
  const currentState = await getState();

  const updatedState: KeyringState = {
    ...currentState,
    accounts: {
      ...currentState.accounts,
      [account.address]: account.privateKey,
    },
  };

  await saveState(updatedState);
}

export async function getPrivateKeyByAddress(address: string): Promise<string> {
  const currentState = await getState();

  let privateKey;
  if (isCaipAccount(address)) {
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
export function isCaipAccount(caip10Account: string): caip10Account is string {
  return (
    typeof caip10Account === 'string' &&
    /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32}):(?<address>[-.%a-zA-Z0-9]{1,128})$/u.test(
      caip10Account,
    )
  );
}
