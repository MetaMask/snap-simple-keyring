/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { KeyringSnapRpcClient } from '@metamask/keyring-api';
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
import { connectSnap, getSnap, getSnapState, sendHello } from '../utils';

const snapId = defaultSnapOrigin;

const initialState = {
  pendingRequests: {},
  accounts: [],
};

const Action = ({ callback }: { callback: () => Promise<any> }) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [input, setInput] = useState<string | null>();
  const [response, setResponse] = useState<string | null>();
  const [error, setError] = useState<string | null>();

  const method = useCallback(async (): Promise<void> => {
    setResponse(null);
    setError(null);

    try {
      const newResponse = await callback();
      setResponse(JSON.stringify(newResponse));
    } catch (newError: any) {
      dispatch({ type: MetamaskActions.SetError, payload: newError });
      setError(JSON.stringify(newError));
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

  async function updateSnapState() {
    try {
      const response = await getSnapState(snapId);
      console.log('Got state', response);
      setSnapState(response);
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      alert(`Problem happened: ${error.message}` || error);
    }
  }

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

  const utilityMethods = [
    {
      name: 'Update snap state',
      description: 'No description',
      actionUI: <Action callback={async () => await updateSnapState()} />,
    },
    {
      name: 'Send hello',
      description: 'Send a simple hello, not a goodbye',
      actionUI: <Action callback={async () => await sendHello()} />,
    },
  ];

  const accountManagementMethods = [
    {
      name: 'Create Account',
      description: 'Method to create a new account',
      actionUI: (
        <Action
          callback={async () => {
            const client = new KeyringSnapRpcClient(snapId);
            return await client.createAccount('Account X', []);
          }}
        />
      ),
    },
    {
      name: 'Get Account',
      description: 'Get the data about a select account',
      actionUI: (
        <Action
          callback={async () => {
            return { response: 'mock response' };
          }}
        />
      ),
    },
    {
      name: 'Edit Account',
      descriptions:
        'Edit an account (provide a object with the attributes to update)', // TODO: Add input field
      actionUI: <Action callback={async () => console.log('Edit Account')} />,
    },
    {
      name: 'List Accounts',
      description: 'Method to list all account that the SSK manages',
      actionUI: (
        <Action
          callback={async () => {
            const client = new KeyringSnapRpcClient(snapId);
            const accounts = await client.listAccounts();
            console.log('[UI] list of accounts:', accounts);
            const addresses = accounts.map(
              (a: { address: string }) => a.address,
            );
            console.log(addresses);
            setSnapState({
              accounts: [],
              pendingRequests: {},
            });
          }}
        />
      ),
    },
    {
      name: 'Update Account',
      description: 'Update a select account', // TODO: Add input field
      actionUI: <Action callback={async () => console.log('Update Account')} />,
    },
    {
      name: 'Remove Account',
      description: 'Remove a select account', // TODO: Add input field
      actionUI: <Action callback={async () => console.log('Remove Account')} />,
    },
  ];

  const requestMethods = [
    {
      name: 'Get Requests',
      description: 'Get all the request made by an account', // TODO: Add input field
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
            <DividerTitle>Account Management Methods</DividerTitle>
            <Accordion items={accountManagementMethods} />
            <Divider />
            <DividerTitle>Request Methods</DividerTitle>
            <Accordion items={requestMethods} />
            <Divider />
            <DividerTitle>Utility Methods</DividerTitle>
            <Accordion items={utilityMethods} />
          </Grid>
          <Grid item xs={4} sm={2} md={1}>
            <Divider />
            <DividerTitle>Current Accounts</DividerTitle>
            {/* TODO: Connect to correct data source */}
            <AccountList accounts={[]} />
          </Grid>
        </Grid>
      </StyledBox>
    </Container>
  );
};

export default Index;
