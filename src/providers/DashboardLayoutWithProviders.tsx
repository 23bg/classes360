'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import DashboardLayout from '@/components/layout/dashboard/DashboardLayout';
import React from 'react';

export function DashboardLayoutWithProviders({
    children,
    showFirstLoginShowcase,
}: {
    children: React.ReactNode;
    showFirstLoginShowcase: boolean;
}) {
    return (
        <ReduxProvider store={store}>
            <DashboardLayout showFirstLoginShowcase={showFirstLoginShowcase}>
                {children}
            </DashboardLayout>
        </ReduxProvider>
    );
}
