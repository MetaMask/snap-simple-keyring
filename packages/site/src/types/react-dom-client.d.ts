/* eslint-disable import/unambiguous */

declare module 'react-dom/client' {
  import type { ReactNode } from 'react';

  type Root = {
    render(children: ReactNode): void;
    unmount(): void;
  };

  export function createRoot(container: Element | DocumentFragment): Root;
}
