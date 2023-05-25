/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Grid from '@mui/material/Grid';
import { useContext, useState, useCallback } from 'react';
import { FiInfo, FiAlertTriangle } from 'react-icons/fi';

import {
  Container,
  CardContainer,
  Divider,
  DividerTitle,
  InformationBox,
  StyledBox,
} from './styledComponents';
import { Card, ConnectButton, AccountList, Accordion } from '../components';
import { defaultSnapOrigin } from '../config';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, getSnap } from '../utils';
import { KeyringClient } from '../utils/client';

const snapId = defaultSnapOrigin;

const initialState = {
  pendingRequests: {},
  accounts: [],
};

const Action = ({ callback }: { callback: () => Promise<any> }) => {
  const [input, setInput] = useState<string | null>();
  const [response, setResponse] = useState<string | null>();
  const [error, setError] = useState<string | null>();

  const method = useCallback(async (): Promise<void> => {
    setResponse(null);
    setError(null);

    try {
      const newResponse = await callback();
      setResponse(newResponse);
    } catch (newError: any) {
      setError(newError);
    }
  }, []);

  return (
    <>
      <button onClick={method}>Execute</button>
      {response && (
        <InformationBox error={false}>
          <FiInfo />
          <p>{response}</p>
        </InformationBox>
      )}
      {error && (
        <InformationBox error={true}>
          <FiAlertTriangle />
          <p>{error}</p>
        </InformationBox>
      )}
    </>
  );
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState(initialState);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const accountManagementMethods = [
    {
      name: 'Create Account',
      description: 'Method to create a new account',
      actionUI: (
        <Action
          callback={async () => {
            const client = new KeyringClient(snapId);
            return await client.createAccount('Account X', []);
          }}
        />
      ),
    },
    {
      name: 'Get Account',
      description: '',
      actionUI: (
        <Action
          callback={async () => {
            // const client = new KeyringClient(snapId);
            // return await client.createAccount('Account X', []);
          }}
        />
      ),
    },
    {
      name: 'Edit Account',
      descriptions: '',
      actionUI: <Action callback={async () => console.log('Edit Account')} />,
    },
    {
      name: 'List Accounts',
      description: 'Method to list all account that the SSK manages',
      actionUI: (
        <Action
          callback={async () => {
            const client = new KeyringClient(snapId);
            return await client.listAccounts();
          }}
        />
      ),
    },
    {
      name: 'Update Account',
      description: '',
      actionUI: <Action callback={async () => console.log('Update Account')} />,
    },
    {
      name: 'Remove Account',
      description: '',
      actionUI: <Action callback={async () => console.log('Remove Account')} />,
    },
  ];

  const requestMethods = [
    {
      name: 'Get Requests',
      description: '',
      actionUI: <Action callback={async () => console.log('Get Requests')} />,
    },
  ];

  return (
    <Container>
      <CardContainer>
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
      </CardContainer>

      <StyledBox sx={{ flexGrow: 1 }}>
        <Grid container spacing={4} columns={[1, 2, 3]}>
          <Grid item xs={8} sm={4} md={2}>
            <Divider />
            <DividerTitle>Account Management</DividerTitle>
            <Accordion items={accountManagementMethods} />
            <Divider />
            <DividerTitle>Requests</DividerTitle>
            <Accordion items={requestMethods} />
          </Grid>
          <Grid item xs={4} sm={2} md={1}>
            <Divider />
            <DividerTitle>Current Accounts</DividerTitle>
            <AccountList
              accounts={[
                {
                  id: 'id-01',
                  name: 'Account 1',
                  address: '0xmock-address-1234-abc',
                  type: 'eip155:eoa',
                  chains: [
                    {
                      id: 'chain-id-01',
                      name: 'chain-name-01',
                    },
                    {
                      id: 'chain-id-02',
                      name: 'chain-name-02',
                    },
                  ],
                },
              ]}
            />
          </Grid>
        </Grid>
      </StyledBox>
    </Container>
  );
};

export default Index;
