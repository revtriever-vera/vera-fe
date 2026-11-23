import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { LeaveDialog } from './leave-dialog';
import { SectionCard } from './section-card';

export function LeaveCard({ onlyOwner }: { readonly onlyOwner: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const [open, setOpen] = useState<boolean>(false);

    return (
        <SectionCard title={t('leaveCardTitle')} description={onlyOwner ? undefined : t('leaveCardBody')}>
            {onlyOwner ? (
                <Alert tone="caution" title={t('leaveOnlyOwner')} />
            ) : (
                <div>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={(): void => {
                            setOpen(true);
                        }}
                    >
                        {t('leaveOpen')}
                    </Button>
                </div>
            )}
            {open ? (
                <LeaveDialog
                    onClose={(): void => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </SectionCard>
    );
}
