/**
 * Returns the MetaMask Ethereum provider injected into the page.
 *
 * @throws If MetaMask is not installed or the provider is not available.
 * @returns The `window.ethereum` EIP-1193 provider.
 */
export const getEthereumProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not available.');
  }

  return window.ethereum;
};
