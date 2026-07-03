import { createRoot } from 'react-dom/client';

import { App } from './App';
import { Root } from './Root';

// eslint-disable-next-line import/no-unassigned-import
import 'bootstrap/dist/css/bootstrap.min.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

createRoot(rootElement).render(
  <Root>
    <App />
  </Root>,
);
