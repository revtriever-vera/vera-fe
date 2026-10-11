import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { I18nProvider } from '@/app/providers/i18n-provider';
import { QueryProvider } from '@/app/providers/query-provider';
import { SessionProvider } from '@/app/providers/session-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import { routeTree } from './routeTree.gen';
import './index.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const rootElement: HTMLElement | null = document.getElementById('root');

if (!rootElement) {
    throw new Error('root element not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <I18nProvider>
            <QueryProvider>
                <SessionProvider>
                    <ToastProvider>
                        <RouterProvider router={router} />
                    </ToastProvider>
                </SessionProvider>
            </QueryProvider>
        </I18nProvider>
    </StrictMode>
);
