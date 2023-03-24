import { Address } from '@ethereumjs/util';

import { WalletState } from '.';
import { getState, saveState } from './stateManagement';

export enum AccountManagementTypes {
  AddAccounts = 'addAccounts',
  RemoveAccounts = 'removeAccounts',
}

export type Account = {
  account: string;
  privateKey: string;
};

/**
 *
 */
export function createAccount(): { account: string; privateKey: string } {
  const privateKey = new Uint8Array(32);
  const privateKeyBuffer = Buffer.from(crypto.getRandomValues(privateKey));

  // @ts-ignore
  const address = Address.fromPrivateKey(privateKeyBuffer);
  const caip10Account = `eip155:1:${address.toString()}`;

  return {
    account: caip10Account,
    privateKey: privateKeyBuffer.toString('hex'),
  };
}

/**
 *
 */
export async function upsertAccount(account: Account): Promise<void> {
  const currentState = await getState();

  const updatedState: WalletState = {
    ...currentState,
    accounts: {
      ...currentState.accounts,
      [account.account]: account.privateKey,
    },
  };

  await saveState(updatedState);
}

/**
 *
 */
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

  return address;
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
