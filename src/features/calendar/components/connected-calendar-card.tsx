import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import type { ConnectionView } from '../types';
import { CalendarHeading } from './calendar-heading';
import { DisconnectCalendarDialog } from './disconnect-calendar-dialog';

export function ConnectedCalendarCard({ view }: { readonly view: ConnectionView }): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const [confirming, setConfirming] = useState<boolean>(false);
    const permission: string = view.access === 'read_only' ? t('permission.readOnly') : t('permission.readWrite');
    return (
        <Card className="flex flex-col gap-3">
            <CalendarHeading badge={<Badge tone="positive">{t('connected')}</Badge>} />
            <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-content">{view.email ?? ''}</p>
                <p className="text-sm text-content-muted">{permission}</p>
            </div>
            <Button
                variant="secondary"
                className="self-start"
                onClick={(): void => {
                    setConfirming(true);
                }}
            >
                {t('disconnect.action')}
            </Button>
            {confirming ? (
                <DisconnectCalendarDialog
                    onClose={(): void => {
                        setConfirming(false);
                    }}
                />
            ) : null}
        </Card>
    );
}
