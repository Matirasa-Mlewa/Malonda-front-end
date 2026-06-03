import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { GuestGuardProvider } from './context/GuestGuardContext';
import './assets/styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GuestGuardProvider>
          <CartProvider>
            <NotificationProvider>
              <div className="app-container">
                <AppRoutes />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1a7a4a',
                      color: '#fff',
                      fontSize: '13px',
                      borderRadius: '10px',
                      padding: '10px 16px',
                    },
                    error:   { style: { background: '#c0392b' } },
                    warning: { style: { background: '#f5a623', color: '#111' } },
                  }}
                />
              </div>
            </NotificationProvider>
          </CartProvider>
        </GuestGuardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
