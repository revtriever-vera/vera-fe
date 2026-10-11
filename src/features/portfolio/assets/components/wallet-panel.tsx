import type { UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Money } from '@/shared/ui/money';
import { Skeleton } from '@/shared/ui/skeleton';
import { useClasses } from '../../api/use-classes.query';
import { useHoldings } from '../../api/use-holdings.query';
import type { AssetClassView, HoldingView, HoldingsResponse } from '../../types';
import { walletTotals } from '../lib/wallet-totals';
import { RemoveHoldingDialog } from './remove-holding-dialog';
import { WalletItem } from './wallet-item';

export interface WalletPanelProps {
    readonly showHeading?: boolean;
    readonly className?: string;
}

interface WalletListProps {
    readonly holdings: HoldingsResponse['data'];
    readonly baseCurrency: HoldingsResponse['baseCurrency'];
}

function WalletSkeleton(): ReactElement {
    return (
        <div role="status" aria-busy="true" className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
}

function useClassMap(): ReadonlyMap<string, AssetClassView> {
    const classes: readonly AssetClassView[] = useClasses().data?.data ?? [];
    return new Map(classes.map((item: AssetClassView): [string, AssetClassView] => [item.id, item]));
}

function WalletTotal({ holdings, baseCurrency }: WalletListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
            <span className="text-content-muted">{t('wallet.total')}</span>
            <Money amountMinor={walletTotals(holdings).totalMinor} currency={baseCurrency} className="text-base font-bold text-content" />
        </div>
    );
}

function WalletList({ holdings, baseCurrency }: WalletListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const classes: ReadonlyMap<string, AssetClassView> = useClassMap();
    const [removing, setRemoving] = useState<HoldingView | null>(null);
    return (
        <>
            <WalletTotal holdings={holdings} baseCurrency={baseCurrency} />
            <ul aria-label={t('wallet.listLabel')} className="flex flex-col gap-1.5">
                {holdings.map((holding: HoldingView): ReactElement => (
                    <WalletItem
                        key={`${holding.kind}-${holding.id}`}
                        holding={holding}
                        assetClass={holding.classId === null ? undefined : classes.get(holding.classId)}
                        baseCurrency={baseCurrency}
                        onRemove={setRemoving}
                    />
                ))}
            </ul>
            {removing === null ? null : (
                <RemoveHoldingDialog
                    holding={removing}
                    onClose={(): void => {
                        setRemoving(null);
                    }}
                />
            )}
        </>
    );
}

function WalletBody(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const holdings: UseQueryResult<HoldingsResponse> = useHoldings();
    if (holdings.isError) {
        return <FailureAlert error={holdings.error} title={t('wallet.loadFailed')} />;
    }
    if (holdings.data === undefined) {
        return <WalletSkeleton />;
    }
    if (holdings.data.data.length === 0) {
        return <p className="py-4 text-center text-sm text-content-muted">{t('wallet.empty')}</p>;
    }
    return <WalletList holdings={holdings.data.data} baseCurrency={holdings.data.baseCurrency} />;
}

export function WalletPanel({ showHeading = true, className }: WalletPanelProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const count: number = useHoldings().data?.data.length ?? 0;
    return (
        <section aria-labelledby={showHeading ? 'wallet-panel-heading' : undefined} className={cn('min-w-0', className)}>
            {showHeading ? (
                <h3 id="wallet-panel-heading" className="mb-2 text-xs font-bold tracking-[0.07em] text-content-muted uppercase">
                    {t('wallet.heading', { count })}
                </h3>
            ) : null}
            <WalletBody />
        </section>
    );
}
