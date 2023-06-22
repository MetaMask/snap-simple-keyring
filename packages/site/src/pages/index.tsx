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
import {
  KeyringState,
  connectSnap,
  getSnap,
  getSnapState,
  sendHello,
} from '../utils';
import {
  QueryRequestForm,
  QueryRequestFormType,
} from '../components/QueryRequestForm';

const snapId = defaultSnapOrigin;

const initialState: {
  pendingRequests: KeyringRequest[];
  accounts: KeyringAccount[];
} = {
  pendingRequests: [],
  accounts: [],
};

const Action = ({
  enabled = true,
  callback,
}: {
  enabled: boolean;
  callback: () => Promise<any>;
}) => {
  const [, dispatch] = useContext(MetaMaskContext);
  const [response, setResponse] = useState<string | null>();
  const [error, setError] = useState<string | null>();

  const method = async (): Promise<void> => {
    setResponse(null);
    setError(null);

    try {
      const newResponse = await callback();
      setResponse(JSON.stringify(newResponse));
    } catch (newError: any) {
      dispatch({ type: MetamaskActions.SetError, payload: newError });
      setError(JSON.stringify(newError));
    }
  };

  return (
    <>
      <button onClick={method} disabled={!enabled}>
        Execute
      </button>
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
  const [snapState, setSnapState] = useState<KeyringState>(initialState);
  const [accountName, setAccountName] = useState<string | null>();
  const [accountId, setAccountId] = useState<string | null>();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [accountPayload, setAccountPayload] =
    useState<Pick<KeyringAccount, 'name' | 'options'>>();
  const client = new KeyringSnapRpcClient(snapId, window.ethereum);

  useEffect(() => {
    async function getState() {
      const accounts = await client.listAccounts();
      const pendingRequests = await client.listRequests();
      setSnapState({
        accounts,
        pendingRequests,
      });
    }

    getState().catch((error) => console.error(error));
  }, []);

  const handleAccountIdChange = useCallback(
    (newAccountId: string) => {
      setAccountId(newAccountId);
    },
    [accountId],
  );

  const handleRequestIdChange = useCallback(
    (newRequestId: string) => {
      setRequestId(newRequestId);
    },
    [requestId],
  );

  const handleAccountPayloadChange = useCallback(
    (newAccountPayload: KeyringAccount) => {
      setAccountPayload(newAccountPayload);
    },
    [accountPayload],
  );

  const sendCreateAccount = async () => {
    console.log('Creating account', accountName);
    const newAccount = await client.createAccount(accountName as string);
    const accounts = await client.listAccounts();
    setSnapState({
      ...snapState,
      accounts,
    });
    return newAccount;
  };

  async function updateSnapState() {
    try {
      const response = await getSnapState(snapId);
      console.log('Got state', response);
      setSnapState(response);
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert, @typescript-eslint/restrict-template-expressions, no-restricted-globals
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
      actionUI: (
        <Action enabled callback={async () => await updateSnapState()} />
      ),
    },
    {
      name: 'Send hello',
      description: 'Send a simple hello, not a goodbye',
      actionUI: <Action enabled callback={async () => await sendHello()} />,
    },
  ];

  const accountManagementMethods = [
    {
      name: 'Create Account',
      description: 'Method to create a new account',
      inputUI: (
        <FormGroup>
          <FormLabel>Account Name</FormLabel>
          <TextField
            fullWidth
            type="text"
            variant="outlined"
            label={'Name'}
            onChange={(event) => {
              console.log(event.target.value);
              setAccountName(event.target.value);
            }}
          />
        </FormGroup>
      ),
      actionUI: (
        <Action
          enabled={!!accountName}
          callback={async () => {
            return await sendCreateAccount();
          }}
        />
      ),
    },
    {
      name: 'Get Account',
      description: 'Get the data about a select account',
      inputUI: (
        <QueryRequestForm
          type={QueryRequestFormType.Account}
          onChange={handleAccountIdChange}
        />
      ),
      actionUI: (
        <Action
          enabled={!!accountId}
          callback={async () => {
            try {
              const account = await client.getAccount(accountId as string);
              return account;
            } catch (error) {
              console.error(error);
              dispatch({ type: MetamaskActions.SetError, payload: error });
            }
          }}
        />
      ),
    },
    {
      name: 'Edit Account',
      descriptions:
        'Edit an account (provide a object with the attributes to update)',
      actionUI: (
        <Action
          enabled
          callback={async () => {
            const result = await client.updateAccount(
              accountPayload as KeyringAccount,
            );
            const accounts = await client.listAccounts();
            setSnapState({
              accounts,
              pendingRequests: {
                ...snapState.pendingRequests,
              },
            });
            return result;
          }}
        />
      ),
    },
    {
      name: 'List Accounts',
      description: 'Method to list all account that the SSK manages',
      actionUI: (
        <Action
          enabled
          callback={async () => {
            const accounts = await client.listAccounts();
            console.log('[UI] list of accounts:', accounts);
            const addresses = accounts.map(
              (a: { address: string }) => a.address,
            );
            console.log(addresses);
            setSnapState({
              ...snapState,
              accounts,
            });
            return { accounts };
          }}
        />
      ),
    },
    {
      name: 'Remove Account',
      description: 'Remove a select account',
      inputUI: (
        <QueryRequestForm
          type={QueryRequestFormType.Account}
          onChange={handleAccountIdChange}
        />
      ),
      actionUI: (
        <Action
          enabled={!!accountId}
          callback={async () => {
            const result = await client.deleteAccount(accountId as string);
            return result;
          }}
        />
      ),
    },
  ];

  const requestMethods = [
    {
      name: 'Get Request by Id',
      description: 'Get a request made by id',
      inputUI: (
        <QueryRequestForm
          type={QueryRequestFormType.Request}
          onChange={handleRequestIdChange}
        />
      ),
      actionUI: (
        <Action
          enabled={!!requestId}
          callback={async () => {
            try {
              const request = await client.getRequest(requestId as string);
              console.log(request);
              return request;
            } catch (error) {
              console.error(error);
              return error;
            }
          }}
        />
      ),
    },
    {
      name: 'Get all Requests',
      description: 'Get all requests',
      actionUI: (
        <Action
          enabled
          callback={async () => {
            const requests = await client.listRequests();
            return requests;
          }}
        />
      ),
    },
    {
      name: 'Approve a request',
      description: 'Approve a request by their id',
      inputUI: (
        <QueryRequestForm
          type={QueryRequestFormType.Request}
          onChange={handleRequestIdChange}
        />
      ),
      actionUI: (
        <Action
          enabled={!!requestId}
          callback={async () => {
            const request = await client.approveRequest(requestId as string);
            return request;
          }}
        />
      ),
    },
    {
      name: 'Reject a request',
      description: 'Get a request made by id',
      inputUI: (
        <QueryRequestForm
          type={QueryRequestFormType.Request}
          onChange={handleRequestIdChange}
        />
      ),
      actionUI: (
        <Action
          enabled={!!requestId}
          callback={async () => {
            const request = await client.getRequest(requestId as string);
            return request;
          }}
        />
      ),
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
            <AccountList accounts={snapState.accounts} />
          </Grid>
        </Grid>
      </StyledBox>
    </Container>
  );
};

export default Index;
