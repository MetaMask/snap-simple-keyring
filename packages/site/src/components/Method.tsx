import Grid from '@mui/material/Grid';
import React, { useState } from 'react';
import styled from 'styled-components';

import { AlertBanner, AlertType } from './AlertBanner';
import { MethodButton } from './Buttons';
import { CopyableItem } from './CopyableItem';
import { InputType } from '../types';

const StyledDescription = styled.p`
  font-size: 14px;
  padding-top: 16px;
  padding-left: 16px;
`;

const InputTitle = styled.p`
  font-size: 14px;
  font-weight: bold;
  margin: 5px 2.5% 5px 16px;
`;

const StyledSelect = styled.select`
  width: 95%;
  padding: 10px;
  margin-top: 8px;
  margin-left: 16px;
  border-radius: 5px;
`;

const StyledSelectItem = styled.option`
  margin-left: 16px;

  :disabled {
    font-style: italic;
  }
`;

const TextField = styled.input`
  width: 95%;
  padding: 10px;
  margin: 8px 2.5% 8px 16px;
  background: transparent;
  border-radius: 5px;
  box-sizing: border-box;
  border: 1px solid #bbc0c5;
`;

const CopyableContainer = styled.div`
  width: 95%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  margin-top: 20px;
`;

export type MethodProps = {
  description: string;
  inputs: {
    title: string;
    placeholder: string;
    onChange: () => null;
    type: InputType;
  }[];
  action: {
    callback: () => Promise<unknown>;
    disabled: boolean;
    label: string;
  };
  successMessage?: string;
  failureMessage?: string;
};

export const Method = ({
  description,
  inputs,
  action,
  successMessage,
  failureMessage,
}: MethodProps) => {
  const [response, setResponse] = useState<unknown>();
  const [error, setError] = useState<unknown>();

  const inputSwitch = (props: any) => {
    switch (props.type) {
      case InputType.TextField:
        return (
          <TextField
            id="outlined-basic"
            placeholder={props.placeholder}
            variant="no-outlined"
            onChange={props.onChange}
          />
        );
      case InputType.Dropdown:
        return (
          <StyledSelect onChange={props.onChange}>
            <StyledSelectItem disabled value="">
              {props.placeholder}
            </StyledSelectItem>
            {props.options.map((option: { value: string | number }) => (
              <StyledSelectItem value={option.value} key={option.value}>
                {option.value}
              </StyledSelectItem>
            ))}
          </StyledSelect>
        );
      default:
        return null;
    }
  };

  return (
    <Grid
      container
      direction="column"
      spacing={4}
      style={{
        overflowX: 'hidden',
      }}
    >
      <StyledDescription item xs={1}>
        {description}
      </StyledDescription>
      {inputs?.map(
        (input: {
          title: string;
          placeholder: string;
          onChange: () => null;
          type: InputType;
        }) => (
          <Grid key={input.title}>
            <InputTitle>{input.title}</InputTitle>
            {inputSwitch(input)}
          </Grid>
        ),
      )}

      {action && (
        <MethodButton
          onClick={async () => {
            setResponse(null);
            setError(null);
            try {
              const res = await action.callback();
              setResponse(res);
              // eslint-disable-next-line id-length
            } catch (e: any) {
              setError(e);
            }
          }}
          disable={action.disabled}
          label={action.label}
        />
      )}

      <CopyableContainer>
        {response && (
          <>
            <AlertBanner
              title={successMessage ?? 'Successful Request'}
              alertType={AlertType.Success}
            />
            <CopyableItem value={JSON.stringify(response, null, 3)} />
          </>
        )}
        {error && (
          <>
            <AlertBanner
              title={failureMessage ?? 'Error Request'}
              alertType={AlertType.Failure}
            />
            <CopyableItem value={JSON.stringify(error)} />
          </>
        )}
      </CopyableContainer>
    </Grid>
  );
};
