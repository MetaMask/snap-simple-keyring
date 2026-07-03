import type { FunctionComponent, ReactNode } from 'react';
import { StrictMode } from 'react';

import { MetaMaskProvider } from './hooks';

export type RootProps = {
  children: ReactNode;
};

export const Root: FunctionComponent<RootProps> = ({ children }) => (
  <StrictMode>
    <MetaMaskProvider>{children}</MetaMaskProvider>
  </StrictMode>
);
