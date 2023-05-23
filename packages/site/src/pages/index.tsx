import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useContext, useState, SyntheticEvent } from 'react';
import styled from 'styled-components';

import { Container, CardContainer } from './styledComponents';
import { Card } from '../components';
import { defaultSnapOrigin } from '../config';
import { MetaMaskContext } from '../hooks';

const snapId = defaultSnapOrigin;

const initialState = {
  pendingRequests: {},
  accounts: [],
};

const ActionUI = ({ callback }: { callback: Promise<any> }) => {
  const [input, SetInput] = useState<string>('');

  return (
    <>
      <button onClick={callback}>Execute</button>
    </>
  );
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [snapState, setSnapState] = useState(initialState);

  const accountManagementMethods = [
    {
      name: 'Create Accounts',
      descriptions: '',
      actionUI: (
        <ActionUI callback={async () => console.log('Create Account')} />
      ),
    },
    {
      name: 'Get Account',
      descriptions: '',
      actionUI: <ActionUI callback={async () => console.log('Get Account')} />,
    },
    {
      name: 'Edit Account',
      descriptions: '',
      actionUI: <ActionUI callback={async () => console.log('Edit Account')} />,
    },
    {
      name: 'List Accounts',
      descriptions: '',
      actionUI: <ActionUI callback={async () => console.log('List Account')} />,
    },
    {
      name: 'Update Account',
      descriptions: '',
      actionUI: (
        <ActionUI callback={async () => console.log('Update Account')} />
      ),
    },
    {
      name: 'Remove Account',
      descriptions: '',
      actionUI: (
        <ActionUI callback={async () => console.log('Remove Account')} />
      ),
    },
  ];

  return (
    <Container>
      <Divider variant="middle">Account Management</Divider>
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
      <Divider variant="middle">Request Management</Divider>
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
      <Divider variant="middle" />
    </Container>
  );
};

export default Index;
