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
};

export const Method = ({ description, inputs, action }: MethodProps) => {
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
          <StyledSelect onChange={() => console.log('Hello from dropdown')}>
            <StyledSelectItem disabled value="">
              <em>{props.placeholder}</em>
            </StyledSelectItem>
            {props.options.map((option: { value: string | number }) => (
              <StyledSelectItem value={option.value}>
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
      {inputs
        ? inputs.map(
            (input: {
              title: string;
              placeholder: string;
              onChange: () => null;
              type: InputType;
            }) => (
              <Grid>
                <InputTitle>{input.title}</InputTitle>
                {inputSwitch(input)}
              </Grid>
            ),
          )
        : null}

      {action ? (
        <MethodButton
          onClick={async () => {
            try {
              const res = await action.callback();
              setResponse(res);
              // eslint-disable-next-line id-length
            } catch (e: any) {
              setResponse(null);
              setError(e);
            }
          }}
          disable={action.disabled}
          label={action.label}
        />
      ) : null}

      <CopyableContainer>
        {response ? (
          <>
            <AlertBanner
              title={'Account Created'}
              alertType={AlertType.Success}
            />
            <CopyableItem value={JSON.stringify(response, null, 2)} />
          </>
        ) : null}
        {error ? (
          <>
            <AlertBanner
              title={'Account Created'}
              alertType={AlertType.Success}
            />
            <CopyableItem value={JSON.stringify(response, null, 2)} />
          </>
        ) : null}
      </CopyableContainer>
    </Grid>
  );
};
