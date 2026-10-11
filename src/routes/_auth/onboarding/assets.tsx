import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AssetsStepPage } from '@/features/onboarding/pages/assets-step-page';
import { useHoldings } from '@/features/portfolio/api/use-holdings.query';
import { AssetPicker } from '@/features/portfolio/assets/components/asset-picker';
import { WalletPanel } from '@/features/portfolio/assets/components/wallet-panel';

function AssetsRoute(): ReactElement {
    const count: number = useHoldings().data?.data.length ?? 0;
    return (
        <AssetsStepPage
            typePicker={<AssetPicker className="sm:grid-cols-1" />}
            wallet={<WalletPanel showHeading={false} />}
            assetCount={count}
        />
    );
}

export const Route = createFileRoute('/_auth/onboarding/assets')({
    component: AssetsRoute
});
