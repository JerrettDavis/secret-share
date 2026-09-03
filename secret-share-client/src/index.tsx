import React from 'react';
import ReactDOM from 'react-dom/client';

// Fonts are self-hosted on purpose. This app renders decrypted plaintext
// secrets, so it must not make a third-party request from that page — and it
// has to keep working in offline / air-gapped self-hosted deployments.
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/jetbrains-mono';

import App from './App';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
