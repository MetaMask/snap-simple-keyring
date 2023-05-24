/* eslint-disable @typescript-eslint/no-misused-promises */
import { useContext, useState, useCallback } from 'react';
import { FiInfo, FiAlertTriangle } from 'react-icons/fi';

import {
  Container,
  CardContainer,
  Divider,
  DividerTitle,
  InformationBox,
} from './styledComponents';
import { Card, ConnectButton, AccountList } from '../components';
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

  const requestManagementMethod = [
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

      <AccountList accounts={[]} />
      <Divider />
      <DividerTitle>Account Management</DividerTitle>
      <CardContainer>
        {accountManagementMethods.map((method: any) => (
          <Card
            content={{
              title: method.name,
              description: method.description,
              button: method.actionUI,
            }}
          />
        ))}
      </CardContainer>
      <Divider />
      <DividerTitle>Requests</DividerTitle>
      <CardContainer>
        {requestManagementMethod.map((method: any) => (
          <Card
            content={{
              title: method.name,
              description: method.description,
              button: method.actionUI,
            }}
          />
        ))}
      </CardContainer>
    </Container>
  );
};

export default Index;
