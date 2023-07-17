import { KeyringAccount } from '@metamask/keyring-api';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import styled from 'styled-components';

import { CopyIcon } from './icons/CopyIcon';

const AccountTitleContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px;
`;

const AccountTitle = styled.p`
  display: flex;
  margin: 0px;
  color: #000;
  font-family: Euclid Circular B;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px; /* 150% */
`;

const AccountTitleIconContainer = styled.div`
  display: flex;
`;

const AccountContainer = styled.div`
  display: flex;
  flex: 1;
  padding: 16px;
  margin-bottom: 20px;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border-radius: 8px;
  border: 0px solid var(--border-default, #bbc0c5);
  background: var(--background-default, #fff);
  /* lg */
  box-shadow: 0px 2px 40px 0px rgba(0, 0, 0, 0.1);
`;

const AccountRow = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const CopyableItem = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 4px 12px;
  align-items: center;
  gap: 4px;
  flex: 1 0 0;
  border-radius: 4px;
  background: rgba(3, 118, 201, 0.1);
  overflow-x: wrap;
`;

const CopyableItemValue = styled.p`
  color: #0376c9;
  text-align: center;
  max-width: 80%;
  word-wrap: break-word;
  margin: 0px;

  /* Body-SM-Medium */
  font-family: Euclid Circular B;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 166.667% */
  letter-spacing: 0.25px;
`;

const AccountRowTitle = styled.p`
  color: #000;

  /* H6 - Bold 14px */
  font-family: Euclid Circular B;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 140.625%; /* 19.688px */
  margin-bottom: 4px;
`;

const AccountRowValue = styled.p`
  margin: 0px;
  color: #6a737d;

  /* H6 - Normal 14px */
  font-family: Euclid Circular B;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140.625%; /* 19.688px */

  li {
    list-style-type: disc;
  }
`;

export const Account = ({ account }: { account: KeyringAccount }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AccountContainer>
      <AccountTitleContainer>
        <AccountTitle>{account.name}</AccountTitle>
        <AccountTitleIconContainer>
          {isCollapsed ? (
            <ExpandMoreIcon
              fontSize="large"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          ) : (
            <ExpandLessIcon
              fontSize="large"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          )}
        </AccountTitleIconContainer>
      </AccountTitleContainer>
      {!isCollapsed && (
        <>
          <AccountRow>
            <AccountRowTitle>ID</AccountRowTitle>
            <CopyableItem
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={async () => {
                await navigator.clipboard.writeText(account.id);
              }}
            >
              <CopyableItemValue>{account.id}</CopyableItemValue>
              <CopyIcon />
            </CopyableItem>
          </AccountRow>
          <AccountRow>
            <AccountRowTitle>Address</AccountRowTitle>
            <CopyableItem
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={async () => {
                await navigator.clipboard.writeText(account.address);
              }}
            >
              <CopyableItemValue>{account.address}</CopyableItemValue>
              <CopyIcon />
            </CopyableItem>
          </AccountRow>
          <AccountRow>
            <AccountRowTitle>Type</AccountRowTitle>
            <AccountRowValue>{account.type}</AccountRowValue>
          </AccountRow>
          <AccountRow>
            <AccountRowTitle>Account Supported Methods</AccountRowTitle>
            <ul style={{ padding: '0px 0px 0px 16px' }}>
              {account.supportedMethods.map((method, methodIndex) => (
                <AccountRowValue
                  key={`account-${account.id}-method-${methodIndex}`}
                >
                  <li>{method}</li>
                </AccountRowValue>
              ))}
            </ul>
          </AccountRow>
        </>
      )}
    </AccountContainer>
  );
};
