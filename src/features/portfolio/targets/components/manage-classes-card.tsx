import type { ReactElement } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

export interface ManageClassesCardProps {
    readonly onOpen: () => void;
}

export function ManageClassesCard({ onOpen }: ManageClassesCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <Card className="flex flex-col items-start gap-3">
            <div>
                <h3 className="flex items-center gap-2 text-base font-semibold">
                    <Sparkles className="size-4 text-accent-strong" aria-hidden="true" />
                    {t('manage.title')}
                </h3>
                <p className="mt-1 text-sm text-content-muted">{t('manage.description')}</p>
            </div>
            <Button variant="secondary" onClick={onOpen}>
                {t('manage.open')}
            </Button>
        </Card>
    );
}
