import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import type { FeatureAccess } from '@/shared/lib/billing/billing-types';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Alert } from '@/shared/ui/alert';
import { SkeletonPanel } from '@/shared/ui/skeleton-form';
import { useCalendarConnection } from '../api/use-calendar-connection.query';
import { calendarErrorMessage } from '../lib/calendar-error-message';
import { useCalendarReturn } from '../lib/use-calendar-return';
import { CALENDAR_ERROR, CONNECTION_STATUS, type CalendarReturn, type ConnectionView } from '../types';
import { CalendarLockedCard } from './calendar-locked-card';
import { CalendarUnavailableCard } from './calendar-unavailable-card';
import { ConnectedCalendarCard } from './connected-calendar-card';
import { DisconnectedCalendarCard } from './disconnected-calendar-card';
import { UpcomingEvents } from './upcoming-events';

function isDisabled(error: Error): boolean {
    return error instanceof ApiError && error.problem.type === CALENDAR_ERROR.providerDisabled;
}

function ConnectionSections(): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const connection: UseQueryResult<ConnectionView> = useCalendarConnection(true);
    if (connection.isPending) {
        return <SkeletonPanel label={t('loading')} lines={3} />;
    }
    if (connection.error) {
        return isDisabled(connection.error) ? <CalendarUnavailableCard /> : <Alert title={calendarErrorMessage(t, connection.error)} />;
    }
    if (connection.data.status !== CONNECTION_STATUS.active) {
        return <DisconnectedCalendarCard revoked={connection.data.status === CONNECTION_STATUS.revoked} />;
    }
    return (
        <>
            <ConnectedCalendarCard view={connection.data} />
            <UpcomingEvents />
        </>
    );
}

export interface CalendarTabProps {
    readonly returned: CalendarReturn;
    readonly onReturnHandled: () => void;
}

export function CalendarTab({ returned, onReturnHandled }: CalendarTabProps): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const billing: BillingState = useBilling();
    const state: FeatureAccess = billing.featureState('calendar');
    useCalendarReturn(returned, onReturnHandled);
    if (state === 'loading') {
        return <SkeletonPanel label={t('loading')} lines={3} />;
    }
    if (state === 'premium_required') {
        return <CalendarLockedCard />;
    }
    if (state === 'disabled') {
        return <CalendarUnavailableCard />;
    }
    return <ConnectionSections />;
}
