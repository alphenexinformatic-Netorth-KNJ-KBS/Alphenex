import React from 'react';
import ReactDOM from 'react-dom/client';
import { initErrorInterceptor } from '@/utils/errorTracker';
import App from '@/App';
import '@/index.css';

// Initialize global error tracking BEFORE React renders
// This captures all network errors, JS errors, and unhandled promise rejections
initErrorInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
);

// Register Service Worker for offline resilience
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('SW registration failed: ', err);
    });
  });
}