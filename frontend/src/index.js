import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0d1829',
          color: '#e2e8f0',
          border: '1px solid #1e3a5f',
          fontFamily: 'Syne, sans-serif'
        },
        success: { iconTheme: { primary: '#00d4aa', secondary: '#080b14' } },
        error: { iconTheme: { primary: '#ff4757', secondary: '#080b14' } }
      }}
    />
  </BrowserRouter>
);
