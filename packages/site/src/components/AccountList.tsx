/* eslint-disable import/no-extraneous-dependencies */
import type { KeyringAccount } from '@metamask/keyring-api';
import React from 'react';
import styled from 'styled-components';

import { Account } from './Account';

const List = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;
`;

export const AccountList = ({ accounts }: { accounts: KeyringAccount[] }) => (
  <List>
    {accounts.map((account, index) => (
      <Account key={`account-${index}`} account={account} />
    ))}
  </List>
);
