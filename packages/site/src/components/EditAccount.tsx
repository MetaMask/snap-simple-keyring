import { KeyringAccount } from '@metamask/keyring-api';
import {
  FormControl,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

export const EditAccountForm = ({
  accounts,
  onChange,
}: {
  accounts: KeyringAccount[];
  onChange: (account: KeyringAccount) => void;
}) => {
  if (accounts.length === 0) {
    return null;
  }
  const [account, setAccount] = useState<KeyringAccount>(accounts[0]);
  const [updateAccountPayload, setUpdateAccountPayload] = useState<
    Pick<KeyringAccount, 'options'>
  >({
    options: {},
  });

  const handleEditAccountChange = (payload: any) => {
    setUpdateAccountPayload({ ...updateAccountPayload, ...payload });
    onChange({ ...account, ...payload });
  };

  return (
    <FormControl>
      <FormGroup row>
        <Select
          label={'Select Account'}
          value={account?.address}
          onChange={(event) => {
            const account = accounts.find(
              (account) => account.address === event.target.value,
            );
            setAccount(account!);
            handleEditAccountChange(account!);
          }}
        >
          {accounts.map((account, index) => {
            return (
              <MenuItem key={index} value={account.address}>
                {account.address}
              </MenuItem>
            );
          })}
        </Select>
      </FormGroup>
      <FormGroup row>
        <FormLabel>Account Options</FormLabel>
        <TextField
          fullWidth
          type="text"
          variant="outlined"
          value={
            updateAccountPayload.options
              ? JSON.stringify(updateAccountPayload.options)
              : JSON.stringify({})
          }
          onChange={(event) =>
            handleEditAccountChange({ options: event.target.value })
          }
        />
      </FormGroup>
    </FormControl>
  );
};
