import type { KeyringAccount, KeyringRequest } from '@metamask/keyring-api';
import { KeyringSnapRpcClient } from '@metamask/keyring-snap-client';
import type {
  ChangeEvent,
  FormEvent,
  FunctionComponent,
  ReactNode,
} from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';

import { defaultSnapOrigin } from './config';
import { MetaMaskContext, MetamaskActions } from './hooks';
import type { KeyringState } from './utils';
import {
  connectSnap,
  getSnap,
  isSynchronousMode,
  toggleSynchronousApprovals,
} from './utils';
import snapPackageInfo from '../../snap/package.json';

const snapId = defaultSnapOrigin;

const initialKeyringState: KeyringState = {
  pendingRequests: [],
  accounts: [],
  useSynchronousApprovals: true,
};

type MethodInput = {
  id: string;
  title: string;
  type: 'text' | 'textarea';
  placeholder: string;
  value: string;
  options?: string[];
  onChange: (value: string) => void;
};

type MethodConfig = {
  name: string;
  description: string;
  inputs?: MethodInput[];
  action: {
    label: string;
    disabled?: boolean;
    callback: () => Promise<unknown>;
  };
};

type SectionProps = {
  name: string;
  testId: string;
  children: ReactNode;
};

const valueBlockClassName =
  'overflow-auto text-break border rounded bg-light font-monospace small p-2 mb-0';

const getClient = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not available.');
  }

  return new KeyringSnapRpcClient(snapId, window.ethereum);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return JSON.stringify(error, null, 2);
};

const formatResponse = (response: unknown) => {
  if (typeof response === 'string') {
    return response;
  }

  return JSON.stringify(response, null, 2);
};

const Section: FunctionComponent<SectionProps> = ({
  name,
  testId,
  children,
}) => (
  <section className="col" data-testid={testId}>
    <div className="card">
      <header className="card-header">
        <h2 className="h4 mb-0">{name}</h2>
      </header>
      <div className="card-body">{children}</div>
    </div>
  </section>
);

const ValueBlock: FunctionComponent<{ value: string }> = ({ value }) => (
  <pre className={valueBlockClassName}>{value}</pre>
);

const ResultTitle: FunctionComponent<{ variant: 'success' | 'danger' }> = ({
  variant,
}) => <p>{`${variant === 'success' ? 'Successful' : 'Error'} request:`}</p>;

const Result: FunctionComponent<{
  value: string;
  variant: 'success' | 'danger';
}> = ({ value, variant }) => (
  <div className={`alert alert-${variant} mb-0`} role="alert">
    <ResultTitle variant={variant} />
    <ValueBlock value={value} />
  </div>
);

const Method: FunctionComponent<MethodConfig> = ({
  description,
  inputs = [],
  action,
}) => {
  const [response, setResponse] = useState<unknown>();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponse(undefined);
    setError(undefined);
    setIsSubmitting(true);

    try {
      const result = await action.callback();
      setResponse(result === undefined ? null : result);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="d-grid gap-3"
      onSubmit={(event) => {
        handleSubmit(event).catch(console.error);
      }}
    >
      <p className="text-muted mb-0">{description}</p>
      {inputs.map((input) => (
        <label className="d-block" key={input.id} htmlFor={input.id}>
          <span className="form-label">{input.title}</span>
          {input.type === 'textarea' ? (
            <textarea
              id={input.id}
              className="form-control"
              placeholder={input.placeholder}
              value={input.value}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                input.onChange(event.currentTarget.value)
              }
            />
          ) : (
            <>
              <input
                id={input.id}
                className="form-control"
                list={`${input.id}-options`}
                placeholder={input.placeholder}
                type="text"
                value={input.value}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  input.onChange(event.currentTarget.value)
                }
              />
              {input.options && (
                <datalist id={`${input.id}-options`}>
                  {input.options.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              )}
            </>
          )}
        </label>
      ))}
      <button
        className="btn btn-primary"
        disabled={(action.disabled ?? false) || isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Running' : action.label}
      </button>
      {response !== undefined && (
        <Result value={formatResponse(response)} variant="success" />
      )}
      {error !== undefined && <Result value={error} variant="danger" />}
    </form>
  );
};

const MethodsSection: FunctionComponent<{
  testId: string;
  methods: MethodConfig[];
}> = ({ testId, methods }) => (
  <>
    {methods.map((method) => {
      const methodTestId = `${testId}-${method.name.replace(/\s/gu, '')}`;

      return (
        <Section key={method.name} name={method.name} testId={methodTestId}>
          <Method key={method.name} {...method} />
        </Section>
      );
    })}
  </>
);

const AccountList: FunctionComponent<{
  accounts: KeyringAccount[];
  onDelete: (accountId: string) => Promise<void>;
}> = ({ accounts, onDelete }) => {
  const [deletingAccountId, setDeletingAccountId] = useState<string>();

  const handleDelete = async (accountId: string) => {
    setDeletingAccountId(accountId);

    try {
      await onDelete(accountId);
    } finally {
      setDeletingAccountId(undefined);
    }
  };

  if (accounts.length === 0) {
    return <p className="text-muted mb-0">No accounts.</p>;
  }

  return (
    <div className="d-grid gap-3">
      {accounts.map((account) => (
        <article className="border rounded p-3" key={account.id}>
          <h3 className="h6 text-break mb-3">{account.address}</h3>
          <dl className="d-grid gap-3 mb-3">
            <div className="d-grid gap-1">
              <dt className="text-muted fw-bold">ID</dt>
              <dd className="mb-0">
                <ValueBlock value={account.id} />
              </dd>
            </div>
            <div className="d-grid gap-1">
              <dt className="text-muted fw-bold">Address</dt>
              <dd className="mb-0">
                <ValueBlock value={account.address} />
              </dd>
            </div>
            <div className="d-grid gap-1">
              <dt className="text-muted fw-bold">Type</dt>
              <dd className="mb-0">{account.type}</dd>
            </div>
            <div className="d-grid gap-1">
              <dt className="text-muted fw-bold">Methods</dt>
              <dd className="mb-0">
                <ul className="mb-0 ps-3 text-break">
                  {account.methods.map((method) => (
                    <li key={`${account.id}-${method}`}>{method}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
          <button
            className="btn btn-danger"
            disabled={deletingAccountId === account.id}
            type="button"
            onClick={() => {
              handleDelete(account.id).catch(console.error);
            }}
          >
            {deletingAccountId === account.id ? 'Deleting' : 'Delete'}
          </button>
        </article>
      ))}
    </div>
  );
};

const SnapConnection: FunctionComponent<{
  hasMetaMask: boolean;
  isInstalled: boolean;
  isConnecting: boolean;
  onConnect: () => Promise<void>;
}> = ({ hasMetaMask, isInstalled, isConnecting, onConnect }) => (
  <Section name="Simple Snap Keyring" testId="SimpleSnapKeyring">
    <form
      className="connection-form"
      onSubmit={(event) => {
        event.preventDefault();
        onConnect().catch(console.error);
      }}
    >
      <label className="mb-3" htmlFor="snap-id">
        <span className="form-label">Snap ID</span>
        <input
          id="snap-id"
          className="form-control"
          data-testid="connect-snap-id"
          disabled={true}
          type="text"
          value={snapId}
          readOnly
        />
      </label>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button
          id="connectButton"
          className="btn btn-primary"
          data-testid="connect-button"
          disabled={!hasMetaMask || isConnecting}
          type="submit"
        >
          {isConnecting
            ? 'Connecting'
            : `${isInstalled ? 'Reconnect' : 'Connect'} Simple Snap Keyring`}
        </button>
        {isInstalled && (
          <span className="badge text-bg-success" id="snapConnected">
            Connected
          </span>
        )}
      </div>
      <p className="text-muted">Version {snapPackageInfo.version}</p>
    </form>
  </Section>
);

const Options: FunctionComponent<{
  enabled: boolean;
  checked: boolean;
  isToggling: boolean;
  onToggle: () => Promise<void>;
}> = ({ enabled, checked, isToggling, onToggle }) => (
  <Section name="Options" testId="Options">
    <label
      className="d-flex gap-2 align-items-center"
      htmlFor="use-sync-flow-toggle"
    >
      <input
        id="use-sync-flow-toggle"
        className="form-check-input m-0"
        data-testid="use-sync-flow-toggle"
        disabled={!enabled || isToggling}
        type="checkbox"
        checked={checked}
        onChange={() => {
          onToggle().catch(console.error);
        }}
      />
      <span>Use Synchronous Approval</span>
    </label>
  </Section>
);

export const App: FunctionComponent = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState<KeyringState>(initialKeyringState);
  const [privateKey, setPrivateKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accountObject, setAccountObject] = useState('');
  const [requestId, setRequestId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTogglingSync, setIsTogglingSync] = useState(false);

  const handleError = useCallback(
    (error: unknown) => {
      console.error(error);
      dispatch({
        type: MetamaskActions.SetError,
        payload:
          error instanceof Error ? error : new Error(getErrorMessage(error)),
      });
    },
    [dispatch],
  );

  const syncAccounts = useCallback(async () => {
    const accounts = await getClient().listAccounts();
    setSnapState((currentState) => ({
      ...currentState,
      accounts,
    }));
    return accounts;
  }, []);

  const syncRequests = useCallback(async () => {
    const pendingRequests = await getClient().listRequests();
    setSnapState((currentState) => ({
      ...currentState,
      pendingRequests,
    }));
    return pendingRequests;
  }, []);

  const refreshSnapState = useCallback(async () => {
    const client = getClient();
    const [accounts, pendingRequests, useSynchronousApprovals] =
      await Promise.all([
        client.listAccounts(),
        client.listRequests(),
        isSynchronousMode(),
      ]);

    setSnapState({
      accounts,
      pendingRequests,
      useSynchronousApprovals,
    });
  }, []);

  useEffect(() => {
    if (!state.installedSnap) {
      setSnapState(initialKeyringState);
      return;
    }

    refreshSnapState().catch(handleError);
  }, [handleError, refreshSnapState, state.installedSnap]);

  const handleConnectClick = async () => {
    setIsConnecting(true);

    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });

      if (installedSnap) {
        await refreshSnapState();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUseSyncToggle = async () => {
    setIsTogglingSync(true);

    try {
      await toggleSynchronousApprovals();
      setSnapState((currentState) => ({
        ...currentState,
        useSynchronousApprovals: !currentState.useSynchronousApprovals,
      }));
    } catch (error) {
      handleError(error);
    } finally {
      setIsTogglingSync(false);
    }
  };

  const createAccount = async () => {
    const newAccount = await getClient().createAccount();
    await syncAccounts();
    return newAccount;
  };

  const importAccount = async () => {
    if (!privateKey) {
      throw new Error('Private key is required.');
    }

    const newAccount = await getClient().createAccount({ privateKey });
    await syncAccounts();
    return newAccount;
  };

  const deleteAccount = async (accountIdToDelete = accountId) => {
    if (!accountIdToDelete) {
      throw new Error('Account ID is required.');
    }

    await getClient().deleteAccount(accountIdToDelete);
    await syncAccounts();
  };

  const updateAccount = async () => {
    if (!accountObject) {
      throw new Error('Account object is required.');
    }

    const account = JSON.parse(accountObject) as KeyringAccount;
    await getClient().updateAccount(account);
    await syncAccounts();
  };

  const accountIds = snapState.accounts.map((account) => account.id);

  const accountManagementMethods: MethodConfig[] = [
    {
      name: 'Create account',
      description: 'Create a new account.',
      action: {
        callback: createAccount,
        disabled: !state.installedSnap,
        label: 'Create Account',
      },
    },
    {
      name: 'Import account',
      description: 'Import an account using a private key.',
      inputs: [
        {
          id: 'import-account-private-key',
          title: 'Private key',
          value: privateKey,
          type: 'text',
          placeholder:
            'E.g. 0000000000000000000000000000000000000000000000000000000000000000',
          onChange: setPrivateKey,
        },
      ],
      action: {
        callback: importAccount,
        disabled: !state.installedSnap || !privateKey,
        label: 'Import Account',
      },
    },
    {
      name: 'Get account',
      description: 'Get data for an account.',
      inputs: [
        {
          id: 'get-account-account-id',
          title: 'Account ID',
          value: accountId,
          type: 'text',
          placeholder: 'E.g. f59a9562-96de-4e75-9229-079e82c7822a',
          options: accountIds,
          onChange: setAccountId,
        },
      ],
      action: {
        disabled: !state.installedSnap || !accountId,
        callback: async () => getClient().getAccount(accountId),
        label: 'Get Account',
      },
    },
    {
      name: 'List accounts',
      description: 'List all accounts managed by the snap.',
      action: {
        disabled: !state.installedSnap,
        callback: syncAccounts,
        label: 'List Accounts',
      },
    },
    {
      name: 'Remove account',
      description: 'Remove an account.',
      inputs: [
        {
          id: 'delete-account-account-id',
          title: 'Account ID',
          value: accountId,
          type: 'text',
          placeholder: 'E.g. 394bd587-7be4-4ffb-a113-198c6a7764c2',
          options: accountIds,
          onChange: setAccountId,
        },
      ],
      action: {
        disabled: !state.installedSnap || !accountId,
        callback: async () => deleteAccount(),
        label: 'Remove Account',
      },
    },
    {
      name: 'Update account',
      description: 'Update an account.',
      inputs: [
        {
          id: 'update-account-account-object',
          title: 'Account Object',
          value: accountObject,
          type: 'textarea',
          placeholder: 'E.g. { "id": "..." }',
          onChange: setAccountObject,
        },
      ],
      action: {
        disabled: !state.installedSnap || !accountObject,
        callback: updateAccount,
        label: 'Update Account',
      },
    },
  ];

  const requestMethods: MethodConfig[] = [
    {
      name: 'Get request',
      description: 'Get a pending request by ID.',
      inputs: [
        {
          id: 'get-request-request-id',
          title: 'Request ID',
          value: requestId,
          type: 'text',
          placeholder: 'E.g. e5156958-16ad-4d5d-9dcd-6a8ba1d34906',
          options: snapState.pendingRequests.map(
            (request: KeyringRequest) => request.id,
          ),
          onChange: setRequestId,
        },
      ],
      action: {
        disabled: !state.installedSnap || !requestId,
        callback: async () => getClient().getRequest(requestId),
        label: 'Get Request',
      },
    },
    {
      name: 'List requests',
      description: 'List pending requests.',
      action: {
        disabled: !state.installedSnap,
        callback: syncRequests,
        label: 'List Requests',
      },
    },
    {
      name: 'Approve request',
      description: 'Approve a pending request by ID.',
      inputs: [
        {
          id: 'approve-request-request-id',
          title: 'Request ID',
          value: requestId,
          type: 'text',
          placeholder: 'E.g. 6fcbe1b5-f250-452c-8114-683dfa5ea74d',
          options: snapState.pendingRequests.map(
            (request: KeyringRequest) => request.id,
          ),
          onChange: setRequestId,
        },
      ],
      action: {
        disabled: !state.installedSnap || !requestId,
        callback: async () => {
          const response = await getClient().approveRequest(requestId);
          await syncRequests();
          return response;
        },
        label: 'Approve Request',
      },
    },
    {
      name: 'Reject request',
      description: 'Reject a pending request by ID.',
      inputs: [
        {
          id: 'reject-request-request-id',
          title: 'Request ID',
          value: requestId,
          type: 'text',
          placeholder: 'E.g. 424ad2ee-56cf-493e-af82-cee79c591117',
          options: snapState.pendingRequests.map(
            (request: KeyringRequest) => request.id,
          ),
          onChange: setRequestId,
        },
      ],
      action: {
        disabled: !state.installedSnap || !requestId,
        callback: async () => {
          const response = await getClient().rejectRequest(requestId);
          await syncRequests();
          return response;
        },
        label: 'Reject Request',
      },
    },
  ];

  return (
    <main className="container-fluid py-3">
      <div className="alert alert-danger" role="alert">
        This is a developer tool for testing purposes. Don't use it to store
        real assets. Use with caution.
      </div>
      {!state.hasMetaMask && (
        <div className="alert alert-warning" role="alert">
          MetaMask was not detected.
        </div>
      )}
      {state.error && (
        <div className="alert alert-danger" role="alert">
          {state.error.message}
        </div>
      )}
      <div className="row gx-3 gy-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
        <SnapConnection
          hasMetaMask={state.hasMetaMask}
          isConnecting={isConnecting}
          isInstalled={Boolean(state.installedSnap)}
          onConnect={handleConnectClick}
        />
        <Section name="Accounts" testId="Accounts">
          <AccountList
            accounts={snapState.accounts}
            onDelete={async (accountIdToDelete) =>
              deleteAccount(accountIdToDelete)
            }
          />
        </Section>
        <Options
          checked={snapState.useSynchronousApprovals}
          enabled={Boolean(state.installedSnap)}
          isToggling={isTogglingSync}
          onToggle={handleUseSyncToggle}
        />
        <MethodsSection
          testId="AccountMethods"
          methods={accountManagementMethods}
        />
        <MethodsSection testId="RequestMethods" methods={requestMethods} />
      </div>
    </main>
  );
};
