import type { ReactElement } from 'react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { billingKeys } from '@/features/billing/api/billing-keys';
import { OfferPage } from '@/features/auth/pages/offer-page';

interface EntrarSearch {
    readonly oferta?: string;
}

function EntrarRoute(): ReactElement {
    const { oferta }: EntrarSearch = Route.useSearch();
    const queryClient: QueryClient = useQueryClient();
    if (oferta === undefined) {
        return <Navigate to="/login" replace />;
    }
    return (
        <OfferPage
            token={oferta}
            onRedeemed={(): void => {
                void queryClient.invalidateQueries({ queryKey: billingKeys.all });
            }}
        />
    );
}

export const Route = createFileRoute('/entrar')({
    validateSearch: (search: Record<string, unknown>): EntrarSearch => ({
        ...(typeof search.oferta === 'string' && search.oferta !== '' ? { oferta: search.oferta } : {})
    }),
    component: EntrarRoute
});
