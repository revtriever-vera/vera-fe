import { useState, type ReactElement } from 'react';
import { CategoryName } from '@/features/spending/components/category-name';
import { CategoryPicker } from '@/features/spending/components/category-picker';
import { CategorySourceBadge } from '@/features/spending/components/category-source-badge';
import { CategoryTile } from '@/features/spending/components/category-tile';
import { FlexibilityToggle } from '@/features/spending/components/flexibility-toggle';
import { IncomeModeDialog } from '@/features/spending/components/income-mode-dialog';
import { InstitutionAvatar } from '@/features/spending/components/institution-avatar';
import { MonthSwitcher } from '@/features/spending/components/month-switcher';
import { SignedAmount } from '@/features/spending/components/signed-amount';
import { SpendingEmptyState } from '@/features/spending/components/spending-empty-state';
import type { CategorySource, CategoryView } from '@/features/spending/types';
import { SampleDataContext, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import { Button } from '@/shared/ui/button';

const SAMPLE_CATEGORIES: readonly CategoryView[] = [
    {
        id: 'c-1',
        systemKey: 'eating_out',
        name: null,
        kind: 'expense',
        flexibility: 'flexible',
        icon: 'UtensilsCrossed',
        position: 6,
        isSystem: true
    },
    { id: 'c-2', systemKey: 'housing', name: null, kind: 'expense', flexibility: 'fixed', icon: 'Home', position: 0, isSystem: true },
    { id: 'c-3', systemKey: 'income', name: null, kind: 'income', flexibility: null, icon: 'TrendingUp', position: 12, isSystem: true },
    {
        id: 'c-4',
        systemKey: 'own_transfer',
        name: null,
        kind: 'transfer',
        flexibility: null,
        icon: 'ArrowLeftRight',
        position: 14,
        isSystem: true
    },
    { id: 'c-5', systemKey: null, name: 'Pets', kind: 'expense', flexibility: 'flexible', icon: 'PawPrint', position: 17, isSystem: false }
];

const SAMPLE_CONTROLS: SampleDataControls = {
    available: true,
    active: false,
    isLoading: false,
    load: (): Promise<void> => Promise.resolve(),
    clear: (): Promise<void> => Promise.resolve()
};

const SOURCES: readonly CategorySource[] = ['user', 'rule', 'dictionary', 'provider'];

function Tiles(): ReactElement {
    return (
        <div className="flex flex-wrap items-center gap-4">
            {SAMPLE_CATEGORIES.map((category: CategoryView): ReactElement => (
                <span key={category.id} className="flex items-center gap-2">
                    <CategoryTile category={category} />
                    <CategoryName category={category} />
                </span>
            ))}
            <span className="flex items-center gap-2">
                <CategoryTile category={null} />
                <CategoryName category={null} />
            </span>
        </div>
    );
}

function Amounts(): ReactElement {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <SignedAmount amountMinor={-35000} currency="BRL" />
            <SignedAmount amountMinor={2800000} currency="BRL" />
            {SOURCES.map((source: CategorySource): ReactElement => (
                <CategorySourceBadge key={source} source={source} />
            ))}
            {SAMPLE_CATEGORIES.slice(0, 2).map((category: CategoryView): ReactElement => (
                <FlexibilityToggle key={category.id} category={category} />
            ))}
        </div>
    );
}

const SAMPLE_LOGO: string =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%238a05be'/%3E%3C/svg%3E";

function Institutions(): ReactElement {
    return (
        <div className="flex items-center gap-3">
            <InstitutionAvatar name="Nubank" logoUrl={SAMPLE_LOGO} />
            <InstitutionAvatar name="Banco Inter" logoUrl={null} />
            <InstitutionAvatar name="Itaú" logoUrl="about:blank#broken" />
            <InstitutionAvatar name="Nubank" logoUrl={SAMPLE_LOGO} size="sm" />
            <InstitutionAvatar name="Banco Inter" logoUrl={null} size="sm" />
        </div>
    );
}

export function SpendingShowcase(): ReactElement {
    const [month, setMonth] = useState<string>('2026-09');
    const [category, setCategory] = useState<string | null>(null);
    const [incomeOpen, setIncomeOpen] = useState<boolean>(false);
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Gastos</h2>
            <Tiles />
            <Amounts />
            <Institutions />
            <MonthSwitcher month={month} previousMonth="2026-08" nextMonth="2026-10" isPartial={month === '2026-10'} onChange={setMonth} />
            <div className="max-w-sm">
                <CategoryPicker label="Categoria" value={category} onChange={setCategory} allowNone direction="out" />
            </div>
            <Button
                variant="secondary"
                className="self-start"
                onClick={(): void => {
                    setIncomeOpen(true);
                }}
            >
                Origem da renda
            </Button>
            <IncomeModeDialog open={incomeOpen} onOpenChange={setIncomeOpen} />
            <SampleDataContext value={SAMPLE_CONTROLS}>
                <SpendingEmptyState />
            </SampleDataContext>
        </section>
    );
}
