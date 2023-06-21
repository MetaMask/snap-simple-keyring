/* eslint-disable import/no-extraneous-dependencies */
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

import { StyledBox } from '../pages/styledComponents';

type Chain = {
  id: string;
  name: string;
};

type Account = {
  id: string;
  name: string;
  address: string;
  type: string;
  chains: Chain[];
  capabilities: string[];
};

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

export const AccountList = ({ accounts }: { accounts: Account[] }) => (
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
        <AccountText>
          {account.address} | {account.type}
        </AccountText>
        <ul>
          {account.chains.map((chain) => (
            <ChainLi key={chain.id}>{chain.name}</ChainLi>
          ))}
        </ul>
        {account.capabilities && (
          <>
            <AccountText>Account Capabilities</AccountText>
            <ul>
              {account.capabilities.map((cap, index) => (
                <ChainLi key={index}>{cap}</ChainLi>
              ))}
            </ul>
          </>
        )}
      </Li>
    ))}
  </List>
);
