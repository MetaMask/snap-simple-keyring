import type { MetaMaskInpageProvider } from '@metamask/providers';

declare module '*.css';

/**
 * Window type extension to support ethereum
 */
declare global {
  /* eslint-disable @typescript-eslint/naming-convention */
  const process: {
    env: {
      NODE_ENV?: 'development' | 'production' | 'test';
      SNAP_ORIGIN?: string | null;
    };
  };
  /* eslint-enable @typescript-eslint/naming-convention */

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
