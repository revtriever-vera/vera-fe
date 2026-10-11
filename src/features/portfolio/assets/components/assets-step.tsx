import { Globe, Info, Plus, Target, Zap } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { useHoldings } from '../../api/use-holdings.query';
import type { BaseCurrency, HoldingsResponse } from '../../types';
import { walletTotals, type WalletTotals } from '../lib/wallet-totals';
import { AssetPicker } from './asset-picker';
import { WalletPanel } from './wallet-panel';
import { WhyList, type WhyItem } from './why-list';

export interface AssetsStepState {
    readonly count: number;
    readonly totalMinor: number;
    readonly baseCurrency: BaseCurrency;
}

export interface AssetsStepProps {
    readonly eyebrow?: string;
    readonly footer: (state: AssetsStepState) => ReactNode;
}

function useWhyItems(): readonly WhyItem[] {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return [
        { icon: Globe, title: t('step.why1Title'), detail: t('step.why1Detail') },
        { icon: Target, title: t('step.why2Title'), detail: t('step.why2Detail') },
        { icon: Zap, title: t('step.why3Title'), detail: t('step.why3Detail') }
    ];
}

function useStepState(): AssetsStepState {
    const data: HoldingsResponse | undefined = useHoldings().data;
    const totals: WalletTotals = walletTotals(data?.data ?? []);
    return { count: totals.count, totalMinor: totals.totalMinor, baseCurrency: data?.baseCurrency ?? 'BRL' };
}

export function AssetsStep({ eyebrow, footer }: AssetsStepProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const why: readonly WhyItem[] = useWhyItems();
    const state: AssetsStepState = useStepState();
    return (
        <div className="grid items-start gap-8 min-[861px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div>
                {eyebrow === undefined ? null : (
                    <span className="text-xs font-bold tracking-[0.07em] text-accent-strong uppercase">{eyebrow}</span>
                )}
                <h2 className="my-1.5 font-display text-3xl font-extrabold text-content">{t('step.title')}</h2>
                <p className="max-w-[54ch] text-base leading-relaxed text-content-muted">{t('step.lead')}</p>
                <WhyList items={why} />
                <p className="mt-5 flex max-w-[54ch] items-start gap-2.5 rounded-control border border-border bg-surface-muted p-3 text-[13.5px] leading-relaxed text-content-muted">
                    <Info className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden="true" />
                    <span>
                        <b className="text-content">{t('step.noteTitle')}</b> {t('step.noteText')}
                    </span>
                </p>
            </div>
            <Card className="p-5">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-content">
                    <Plus className="size-5 text-accent-strong" aria-hidden="true" />
                    {t('step.cardTitle')}
                </h2>
                <p className="mt-1 mb-4 text-sm text-content-muted">{t('step.cardDetail')}</p>
                <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <AssetPicker className="sm:grid-cols-1" />
                    <aside className="rounded-control border border-border bg-surface-muted p-3">
                        <WalletPanel />
                    </aside>
                </div>
                <div className="mt-5 border-t border-border pt-4">{footer(state)}</div>
            </Card>
        </div>
    );
}
