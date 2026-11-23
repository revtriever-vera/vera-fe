import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useCalendarEvents } from '../api/use-calendar-events.query';
import { eventWhen } from '../lib/event-when';
import type { EventItem, EventsView } from '../types';

function EventRow({ item }: { readonly item: EventItem }): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const locale: SupportedLocale = useLocale();
    return (
        <li className="flex items-center justify-between gap-3 border-t border-border py-2 first:border-t-0">
            <div className="flex min-w-0 flex-col">
                <span className="text-xs text-content-muted">{eventWhen(item.start, item.allDay, locale)}</span>
                <span className="text-sm text-content">{item.title}</span>
            </div>
            {item.byVera ? <Badge tone="accent">{t('events.byVera')}</Badge> : null}
        </li>
    );
}

function EventsList({ view }: { readonly view: EventsView }): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    if (view.items.length === 0) {
        return <p className="text-sm text-content-muted">{t('events.empty')}</p>;
    }
    return (
        <ul className="flex flex-col">
            {view.items.map((item: EventItem): ReactElement => (
                <EventRow key={item.id} item={item} />
            ))}
        </ul>
    );
}

function EventsBody(): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const events: UseQueryResult<EventsView> = useCalendarEvents();
    if (events.isPending) {
        return (
            <Loading label={t('events.loading')}>
                <Skeleton className="h-10 w-full" />
            </Loading>
        );
    }
    if (events.error) {
        return (
            <Alert
                title={t('events.error')}
                action={
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(): void => {
                            void events.refetch();
                        }}
                    >
                        {t('events.retry')}
                    </Button>
                }
            />
        );
    }
    return <EventsList view={events.data} />;
}

export function UpcomingEvents(): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    return (
        <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-content">{t('events.title')}</h2>
            <EventsBody />
        </Card>
    );
}
