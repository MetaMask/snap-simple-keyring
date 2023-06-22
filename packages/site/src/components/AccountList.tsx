/* eslint-disable import/no-extraneous-dependencies */
import { KeyringAccount } from '@metamask/keyring-api';
import Grid from '@mui/material/Grid';
import {
  GiAbstract019,
  GiAbstract095,
  GiAnubis,
  GiAstronautHelmet,
  GiBaobab,
  GiBatMask,
  GiFox,
} from 'react-icons/gi';
import styled from 'styled-components';

import { StyledBox } from './styledComponents';

const List = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const Li = styled.li`
  border: 1px solid;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  width: 100%;
`;

const Title = styled.p`
  font-weight: bold;
`;

const AccountText = styled.p`
  margin-top: 10px;
  margin-bottom: 5px;
  font-style: cursive;
`;

const ChainLi = styled.li`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const icons = [
  <GiAbstract019 />,
  <GiAbstract095 />,
  <GiAnubis />,
  <GiBaobab />,
  <GiBatMask />,
  <GiFox />,
  <GiAstronautHelmet />,
];

export const AccountList = ({ accounts }: { accounts: KeyringAccount[] }) => (
  <List>
    {accounts.map((account) => (
      <Li key={account.id}>
        <StyledBox sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={11}>
              <Title>{account.name}</Title>
            </Grid>
            <Grid item xs={1}>
              {icons[Math.floor(Math.random() * icons.length)]}{' '}
            </Grid>
          </Grid>
        </StyledBox>
        <AccountText>Id: {account.id}</AccountText>
        <AccountText>Address: {account.address}</AccountText>
        <AccountText>Type: {account.type}</AccountText>
        {account.supportedMethods && (
          <>
            <AccountText>Account Supported Methods</AccountText>
            <ul>
              {account.supportedMethods.map((method: string, index: number) => (
                <ChainLi key={index}>{method}</ChainLi>
              ))}
            </ul>
          </>
        )}
        {account.options && (
          <>
            <AccountText>Account Options</AccountText>
            <ul>
              {Object.entries(account.options).map(
                (option: [string, any], index: number) => (
                  <AccountText>
                    {option[0]} : {JSON.stringify(option[1])}
                  </AccountText>
                ),
              )}
            </ul>
          </>
        )}
      </Li>
    ))}
  </List>
);
