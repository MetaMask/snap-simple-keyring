import { useContext } from 'react';
import styled, { useTheme } from 'styled-components';
import packageInfo from '../../package.json';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, getSnap } from '../utils';
import { HeaderButtons } from './Buttons';
import { defaultSnapOrigin } from '../config';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  padding-left: 5%;
  padding-right: 5%;
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const VersionStyle = styled.p`
  margin-top: 1.2rem;
  font-size: 1.6rem;
  margin: auto;
  padding-right: 2rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const theme = useTheme();
  const [state, dispatch] = useContext(MetaMaskContext);

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

  function Version() {
    return (
      <VersionStyle>
        <div>
          <b>Dapp version: </b>
          {packageInfo.version}
        </div>

        {state.installedSnap ? (
          <div>
            <b>Snap version installed: </b> {state.installedSnap?.version}
          </div>
        ) : (
          <div>
            <b>Snap version to install: </b> {packageInfo.version}
          </div>
        )}

        {defaultSnapOrigin.startsWith('local') &&
          '(from ' + defaultSnapOrigin + ')'}
      </VersionStyle>
    );
  }

  return (
    <HeaderWrapper>
      <LogoWrapper>
        <Title>🔑 Snap Simple Keyring</Title>
      </LogoWrapper>
      <RightContainer>
        <Version />
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </RightContainer>
    </HeaderWrapper>
  );
};
