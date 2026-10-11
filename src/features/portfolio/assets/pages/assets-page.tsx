import { Plus } from 'lucide-react';
import type { ReactElement } from 'react';
import { useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { UnderConstruction } from '../../components/under-construction';
import { AddAssetModal } from '../components/add-asset-modal';

export function AssetsPage(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const search: { add?: boolean; classId?: string } = useSearch({ from: '/_auth/_app/patrimonio/ativos' });
    const navigate: UseNavigateResult<string> = useNavigate();
    const setOpen = (open: boolean): void => {
        void navigate({ to: '/patrimonio/ativos', search: open ? { add: true, classId: search.classId } : {}, replace: true });
    };
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Button
                    onClick={(): void => {
                        setOpen(true);
                    }}
                >
                    <Plus className="size-4" aria-hidden="true" />
                    {t('addButton')}
                </Button>
            </div>
            <UnderConstruction />
            <AddAssetModal open={search.add === true} onOpenChange={setOpen} initialClassId={search.classId} />
        </div>
    );
}
