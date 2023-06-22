import {
  Box,
  FormControl,
  FormGroup,
  FormLabel,
  TextField,
} from '@mui/material';
import React from 'react';

export enum QueryRequestFormType {
  Account = 'account',
  Request = 'request',
}

export type QueryRequestFormProps = {
  type: QueryRequestFormType;
  onChange: (value: string) => void;
};

export const QueryRequestForm = ({ type, onChange }: QueryRequestFormProps) => {
  const typeLabel =
    type === QueryRequestFormType.Account ? 'Account Id' : 'Request Id';
  return (
    <TextField
      fullWidth
      type="text"
      variant="outlined"
      label={typeLabel}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
