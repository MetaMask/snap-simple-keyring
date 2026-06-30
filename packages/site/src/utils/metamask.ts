/**
 * Detect if MetaMask is installed.
 *
 * @param window - The global window object.
 * @returns `true` if the MetaMask is installed, `false` otherwise.
 */
export const hasMetaMask = async (window: Window) => {
  return typeof window.ethereum !== 'undefined';
};
