import { KeyringAccount } from '@metamask/keyring-api';
import { FormControl, FormGroup, FormLabel, TextField } from '@mui/material';
import React from 'react';

export const EditAccountForm = ({
  accounts,
  onChange,
}: {
  accounts: KeyringAccount[];
  onChange: (account: KeyringAccount) => void;
}) => {
  const [account, setAccount] = React.useState<
    Pick<KeyringAccount, 'name' | 'options'>
  >({
    name: '',
    options: {},
  });

  const handleAccountChange = (event: any) => {
    setAccount({ ...account, [event.target.name]: event.target.value });
  };

  return (
    <FormControl>
      <FormGroup row>
        <FormLabel>Select Account</FormLabel>
        <TextField
          fullWidth
          type="text"
          variant="outlined"
          label={'Name'}
          onChange={handleAccountChange}
        />
      </FormGroup>
      <FormGroup row>
        <FormLabel>Account Name</FormLabel>
        <TextField
          fullWidth
          type="text"
          variant="outlined"
          label={'Name'}
          onChange={handleAccountChange}
        />
      </FormGroup>
      <FormGroup row>
        <FormLabel>Account Options</FormLabel>
        <TextField
          fullWidth
          type="text"
          variant="outlined"
          label={'Name'}
          onChange={handleAccountChange}
        />
      </FormGroup>
    </FormControl>
  );
};
