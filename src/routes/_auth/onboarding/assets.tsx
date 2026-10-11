import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AssetsStepPage } from '@/features/onboarding/pages/assets-step-page';

function AssetsRoute(): ReactElement {
    return <AssetsStepPage typePicker={null} wallet={null} assetCount={0} />;
}

export const Route = createFileRoute('/_auth/onboarding/assets')({
    component: AssetsRoute
});
