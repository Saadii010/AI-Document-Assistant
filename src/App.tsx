/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200/80 dark:border-zinc-800/80 text-sm font-medium rounded-xl shadow-md',
              duration: 4000,
            }}
          />
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

