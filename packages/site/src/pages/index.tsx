import { useContext, useState } from 'react';
import styled from 'styled-components';

import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  sendHello,
  shouldDisplayReconnectButton,
  getSnapState,
  createNewAccount,
  approvePendingRequest,
  clearPendingRequests,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const snapId = defaultSnapOrigin;

const initialState = {
  pendingRequests: {},
  accounts: null,
};

const PendingConfirmationCard = (props) => {
  const { id, request } = props;

  return (
    <Card
      content={{
        title: 'Pending Signature Request...',
        description:
          'Display a custom message within a confirmation screen in MetaMask.',
        button: (
          <SendHelloButton
            onClick={() => approvePendingRequest(snapId, id, request)}
          />
        ),
      }}
    >
      <pre>{JSON.stringify(request, null, 2)}</pre>
    </Card>
  );
};

const WalletManagementCard = (props) => {
  const { updateSnapState, createAccount, selectedAccount } = props;

  const publicAddress = '0x77ac616693b24c0c49cb148dbcb3fac8ccf0c96c';
  const publicKey =
    'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

  async function readAccount() {
    try {
      const response = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request: {
            method: 'manageAccounts',
            params: ['read'],
          },
        },
      });
      console.log('Account read', response);
    } catch (err) {
      console.error(err);
      alert('Problem happened: ' + err.message || err);
    }
  }

  async function updateAccount(privateData) {
    try {
      const account = [publicKey, privateData];

      const response = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request: {
            method: 'manageAccounts',
            params: ['update', account],
          },
        },
      });
      console.log('Account updated', response);
    } catch (err) {
      console.error(err);
      alert('Problem happened: ' + err.message || err);
    }
  }

  async function deleteAccount() {
    try {
      const response = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request: {
            method: 'manageAccounts',
            params: ['delete', selectedAccount],
          },
        },
      });
      console.log('Account delete', response);
      await updateSnapState();
    } catch (err) {
      console.error(err);
      alert('Problem happened: ' + err.message || err);
    }
  }

  return (
    <Card
      content={{
        title: 'Wallet Mgmt',
        description:
          'Display a custom message within a confirmation screen in MetaMask.',
      }}
    >
      <h2>Operations</h2>
      <div>
        <p id="publicAddress"></p>
        <button
          onClick={() => {
            createAccount();
          }}
          className="createAccount"
        >
          Create account
        </button>
        <button
          onClick={() => {
            readAccount();
          }}
          className="readAccount"
        >
          Read account
        </button>
        <button
          onClick={() => {
            updateAccount({ value: 'new updated value' });
          }}
          className="updateAccount"
        >
          Update account
        </button>
        <button
          onClick={() => {
            deleteAccount();
            console.log('deleted account', selectedAccount);
          }}
          className="deleteAccount"
        >
          Delete account
        </button>
      </div>

      <button
        onClick={() => {
          updateSnapState();
        }}
        className="updateSnapState"
      >
        Get state
      </button>
    </Card>
  );
};
const AccountListCard = (props) => {
  const { state, selectAccount } = props;

  return (
    <Card
      content={{
        title: 'Account List',
        description: 'Displays all the accounts of the snap',
      }}
    >
      <b>Selected Account: {selectAccount}</b>
      <select
        onChange={(event) => {
          console.log('selected', event.target.value);
          selectAccount(event.target.value);
        }}
      >
        <option value="">Select Account</option>
        {state.accounts &&
          Object.keys(state.accounts).map((account, i) => {
            return (
              <option key={i} value={account}>
                {account}
              </option>
            );
          })}
      </select>
    </Card>
  );
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState(initialState);
  const [selectedAccount, setSelectedAccount] = useState(null);

  async function updateSnapState() {
    try {
      const response = await getSnapState(snapId);
      console.log('Got state', response);
      setSnapState(response);
    } catch (err) {
      console.error(err);
      alert('Problem happened: ' + err.message || err);
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
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const createAccount = async () => {
    try {
      await createNewAccount();
      await updateSnapState();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
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
        <Card
          content={{
            title: 'Update Snap State',
            description: 'get latest snap state',
            button: (
              <SendHelloButton
                onClick={updateSnapState}
                disabled={!state.installedSnap}
              />
            ),
          }}
        />
        <Card
          content={{
            title: 'Reset Pending',
            description: 'clear pending requests',
            button: (
              <SendHelloButton
                onClick={() => clearPendingRequests(snapId)}
                disabled={!state.installedSnap}
              />
            ),
          }}
        />
        {state.installedSnap && (
          <WalletManagementCard
            updateSnapState={updateSnapState}
            createAccount={createAccount}
            selectedAccount={selectedAccount}
          />
        )}
        {state.installedSnap &&
          Object.entries(snapState.pendingRequests).map(([id, request]) => {
            return (
              <PendingConfirmationCard key={id} id={id} request={request} />
            );
          })}
        {state.installedSnap && snapState.accounts && (
          <AccountListCard
            state={snapState}
            selectAccount={setSelectedAccount}
          />
        )}
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
