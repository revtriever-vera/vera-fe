import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { CalendarHeading } from './calendar-heading';
import { ConnectCalendarModal } from './connect-calendar-modal';

export function DisconnectedCalendarCard({ revoked }: { readonly revoked: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const [open, setOpen] = useState<boolean>(false);
    return (
        <Card className="flex flex-col gap-3">
            <CalendarHeading />
            {revoked ? <Alert tone="caution" title={t('revoked')} /> : null}
            <Button
                className="self-start"
                onClick={(): void => {
                    setOpen(true);
                }}
            >
                {t('connect')}
            </Button>
            {open ? (
                <ConnectCalendarModal
                    onClose={(): void => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </Card>
    );
}
