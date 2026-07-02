import type { MetaMaskInpageProvider } from '@metamask/providers';

/**
 * Returns the MetaMask Ethereum provider injected into the page.
 *
 * @throws If MetaMask is not installed or the provider is not available.
 * @returns The `window.ethereum` EIP-1193 provider.
 */
export const hasEthereumProvider = () => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Returns the MetaMask Ethereum provider injected into the page.
 *
 * @throws If MetaMask is not installed or the provider is not available.
 * @returns The `window.ethereum` EIP-1193 provider.
 */
export const getEthereumProvider = (): MetaMaskInpageProvider => {
  if (!hasEthereumProvider()) {
    throw new Error('MetaMask is not available.');
  }

  // Type-cast here since we have already checked for its existence.
  return window.ethereum as MetaMaskInpageProvider;
};
