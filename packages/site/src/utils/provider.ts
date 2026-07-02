/**
 * Checks if the MetaMask Ethereum provider is available.
 *
 * @returns `true` if the MetaMask Ethereum provider is available, `false` otherwise.
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
export const getEthereumProvider = () => {
  if (!hasEthereumProvider()) {
    throw new Error('MetaMask is not available.');
  }

  return window.ethereum;
};
