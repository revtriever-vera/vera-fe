import { Pencil, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import type { HoldingView } from '../../types';

export interface HoldingRowActionsProps {
    readonly holding: HoldingView;
    readonly onEdit: (holding: HoldingView) => void;
    readonly onRemove: (holding: HoldingView) => void;
}

export function HoldingRowActions({ holding, onEdit, onRemove }: HoldingRowActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="flex items-center justify-end gap-1">
            {holding.kind === 'fixed_income' ? (
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('actions.edit', { name: holding.symbol })}
                    onClick={(): void => {
                        onEdit(holding);
                    }}
                >
                    <Pencil className="size-4" aria-hidden="true" />
                </Button>
            ) : null}
            <Button
                variant="ghost"
                size="sm"
                aria-label={t('actions.remove', { name: holding.symbol })}
                onClick={(): void => {
                    onRemove(holding);
                }}
            >
                <Trash2 className="size-4" aria-hidden="true" />
            </Button>
        </div>
    );
}
