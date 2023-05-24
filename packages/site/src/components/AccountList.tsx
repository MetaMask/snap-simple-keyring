import styled from 'styled-components';

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
};

const List = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const Li = styled.li`
  border: 1px solid black;
  margin-bottom: 10px;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  width: 75rem;

  strong {
    font-weight: bold;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const AccountList = ({ accounts }: { accounts: Account[] }) => (
  <List>
    {accounts.map((account) => (
      <Li key={account.id}>
        <strong>{account.name}</strong>
        <p>Address: {account.address}</p>
        <p>Type: {account.type}</p>
        <ul>
          {account.chains.map((chain) => (
            <li key={chain.id}>{chain.name}</li>
          ))}
        </ul>
      </Li>
    ))}
  </List>
);
