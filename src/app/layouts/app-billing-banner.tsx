import type { ReactElement } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { BillingBanner } from '@/shared/ui/billing-banner';

const PLAN_PATH: string = '/settings/plan';

export function AppBillingBanner(): ReactElement | null {
    const pathname: string = useRouterState({ select: (router): string => router.location.pathname });
    if (pathname.startsWith(PLAN_PATH)) {
        return null;
    }
    return <BillingBanner />;
}
