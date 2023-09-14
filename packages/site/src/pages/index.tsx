import {
  KeyringAccount,
  KeyringRequest,
  KeyringSnapRpcClient,
} from '@metamask/keyring-api';
import Grid from '@mui/material/Grid';
import { useCallback, useContext, useEffect, useState } from 'react';

import {
  Accordion,
  AccountList,
  Card,
  ConnectButton,
  Toggle,
} from '../components';
import {
  CardContainer,
  Container,
  Divider,
  DividerTitle,
  StyledBox,
} from '../components/styledComponents';
import { defaultSnapOrigin } from '../config';
import { MetaMaskContext, MetamaskActions } from '../hooks';
import { InputType } from '../types';
import {
  KeyringState,
  connectSnap,
  getSnap,
  isSynchronousMode,
  toggleSynchronousApprovals,
} from '../utils';

const snapId = defaultSnapOrigin;

const initialState: {
  pendingRequests: KeyringRequest[];
  accounts: KeyringAccount[];
  useSynchronousApprovals: boolean;
} = {
  pendingRequests: [],
  accounts: [],
  useSynchronousApprovals: false,
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState<KeyringState>(initialState);
  // Is not a good practice to store sensitive data in the state of
  // a component but for this case it should be ok since this is an
  // internal development and testing tool.
  const [privateKey, setPrivateKey] = useState<string | null>();
  const [accountId, setAccountId] = useState<string | null>();
  const [requestId, setRequestId] = useState<string | null>(null);
  // const [accountPayload, setAccountPayload] =
  //   useState<Pick<KeyringAccount, 'name' | 'options'>>();
  const client = new KeyringSnapRpcClient(snapId, window.ethereum);

  useEffect(() => {
    async function getState() {
      const accounts = await client.listAccounts();
      const pendingRequests = await client.listRequests();
      const isSynchronous = await isSynchronousMode();
      setSnapState({
        accounts,
        pendingRequests,
        useSynchronousApprovals: isSynchronous,
      });
    }

    getState().catch((error) => console.error(error));
  }, []);

  const handleRequestIdChange = useCallback(
    (newRequestId: string) => {
      setRequestId(newRequestId);
    },
    [requestId],
  );

  const sendCreateAccount = async () => {
    const newAccount = await client.createAccount();
    const accounts = await client.listAccounts();
    setSnapState({
      ...snapState,
      accounts,
    });
    return newAccount;
  };

  const importAccount = async () => {
    const newAccount = await client.createAccount({
      privateKey: privateKey as string,
    });
    const accounts = await client.listAccounts();
    setSnapState({
      ...snapState,
      accounts,
    });
    return newAccount;
  };

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

  const handleUseSyncToggle = useCallback(async () => {
    console.log('Toggling synchronous approval');
    await toggleSynchronousApprovals();
    setSnapState({
      ...snapState,
      useSynchronousApprovals: !snapState.useSynchronousApprovals,
    });
  }, [snapState]);

  const accountManagementMethods = [
    {
      name: 'Create Account',
      description: 'Method to create a new account',
      inputs: [],
      action: {
        callback: async () => {
          return await sendCreateAccount();
        },
        label: 'Create Account',
      },
      successMessage: 'Account Created',
    },
    {
      name: 'Import Account (Private Key)',
      description: 'Method to import an account',
      inputs: [
        {
          title: 'Private Key',
          value: privateKey,
          type: InputType.TextField,
          placeholder: 'Private key',
          onChange: (event: any) => {
            setPrivateKey(event.currentTarget.value);
          },
        },
      ],
      action: {
        callback: async () => {
          return await importAccount();
        },
        label: 'Import Account',
      },
      successMessage: 'Account Imported',
    },
    {
      name: 'Get Account',
      description: 'Get the data about a select account',
      inputs: [
        {
          title: 'Account ID',
          type: InputType.Dropdown,
          placeholder: 'Select Account ID',
          options: snapState.accounts.map((account) => {
            return { value: account.address };
          }),
          onChange: (event: any) => {
            snapState.accounts.forEach((account) => {
              if (account.address === event.currentTarget.value) {
                setAccountId(account.id);
              }
            });
          },
        },
      ],
      action: {
        disabled: Boolean(accountId),
        callback: async () => {
          try {
            const account = await client.getAccount(accountId as string);
            return account;
          } catch (error) {
            dispatch({ type: MetamaskActions.SetError, payload: error });
          }
        },
        label: 'Get data',
      },
      successMessage: 'Data Fetched',
    },
    {
      name: 'List Accounts',
      description: 'Method to list all account that the SSK manages',
      action: {
        disabled: false,
        callback: async () => {
          const accounts = await client.listAccounts();
          const addresses = accounts.map((a: { address: string }) => a.address);
          console.log(addresses);
          setSnapState({
            ...snapState,
            accounts,
          });
          return { accounts };
        },
        label: 'List Accounts',
      },
    },
    {
      name: 'Remove Account',
      description: 'Remove a select account',
      inputs: [
        {
          title: 'Account ID',
          type: InputType.Dropdown,
          placeholder: 'Select Account ID',
          options: snapState.accounts.map((account) => {
            return { value: account.address };
          }),
          onChange: (event: any) => {
            snapState.accounts.forEach((account) => {
              if (account.address === event.currentTarget.value) {
                setAccountId(account.id);
              }
            });
          },
        },
      ],
      action: {
        disabled: Boolean(accountId),
        callback: async () => {
          await client.deleteAccount(accountId as string);
        },
        label: 'Remove account',
      },
      successMessage: 'Account Removed',
    },
  ];

  const requestMethods = [
    {
      name: 'Get Request by Id',
      description: 'Get a request made by id',
      inputs: [
        {
          title: 'Request ID',
          type: InputType.TextField,
          placeholder: 'E.g. Request ID',
          onChange: (event: any) => {
            handleRequestIdChange(event.currentTarget.value);
          },
        },
      ],
      action: {
        enabled: Boolean(requestId),
        callback: async () => {
          try {
            const request = await client.getRequest(requestId as string);
            console.log(request);
            return request;
          } catch (error) {
            console.error(error);
            return error;
          }
        },
        label: 'Get Request',
      },
    },
    {
      name: 'Get all Requests',
      description: 'Get all requests',
      action: {
        disabled: false,
        callback: async () => {
          const requests = await client.listRequests();
          setSnapState({
            ...snapState,
            pendingRequests: requests,
          });
          return { requests };
        },
        label: 'List Pending Requests',
      },
    },
    {
      name: 'Approve a request',
      description: 'Approve a request by their id',
      inputs: [
        {
          title: 'Request ID',
          type: InputType.TextField,
          placeholder: 'E.g. Request ID',
          onChange: (event: any) => {
            handleRequestIdChange(event.currentTarget.value);
          },
        },
      ],
      action: {
        disabled: !requestId,
        callback: async () => {
          try {
            await client.approveRequest(requestId as string);
            return 'Approved';
          } catch (error) {
            console.error(error);
            throw error;
          }
        },
        label: 'Approve Request',
      },
      successMessage: 'Request Approved',
    },
    {
      name: 'Reject a request',
      description: 'Reject a request by id',
      inputs: [
        {
          title: 'Request ID',
          type: InputType.TextField,
          placeholder: 'E.g. Request ID',
          onChange: (event: any) => {
            handleRequestIdChange(event.currentTarget.value);
          },
        },
      ],
      action: {
        disabled: !requestId,
        callback: async () => {
          try {
            await client.rejectRequest(requestId as string);
            return 'Rejected';
          } catch (error) {
            console.error(error);
            throw error;
          }
        },
        label: 'Reject Request',
      },
      successMessage: 'Request Rejected',
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
            <DividerTitle>Options</DividerTitle>
            <Toggle
              title="Use Synchronous Approval"
              checkedIcon="✅"
              uncheckedIcon="❌"
              defaultChecked={snapState.useSynchronousApprovals}
              onToggle={handleUseSyncToggle}
            />
            <Divider>&nbsp;</Divider>
            <DividerTitle>Methods</DividerTitle>
            <Accordion items={accountManagementMethods} />
            <Divider />
            <DividerTitle>Request Methods</DividerTitle>
            <Accordion items={requestMethods} />
            <Divider />
          </Grid>
          <Grid item xs={4} sm={2} md={1}>
            <Divider />
            <DividerTitle>Accounts</DividerTitle>
            <AccountList accounts={snapState.accounts} />
          </Grid>
        </Grid>
      </StyledBox>
    </Container>
  );
};

export default Index;
