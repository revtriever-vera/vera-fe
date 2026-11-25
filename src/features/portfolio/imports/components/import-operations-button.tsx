import { useState, type ReactElement } from 'react';
import { FileUp } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { RoleGate } from '@/app/providers/role-gate';
import { Button } from '@/shared/ui/button';
import { InvestmentImportModal } from './investment-import-modal';

export function ImportOperationsButton(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const [open, setOpen] = useState<boolean>(false);
    return (
        <RoleGate min="editor">
            <Button
                variant="secondary"
                onClick={(): void => {
                    setOpen(true);
                }}
            >
                <FileUp className="size-4" aria-hidden="true" />
                {t('button')}
            </Button>
            {open ? (
                <InvestmentImportModal
                    onClose={(): void => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </RoleGate>
    );
}
