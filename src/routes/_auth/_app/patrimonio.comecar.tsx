import { createFileRoute } from '@tanstack/react-router';
import { AssetsStepPage } from '@/features/portfolio/assets/pages/assets-step-page';

export const Route = createFileRoute('/_auth/_app/patrimonio/comecar')({
    component: AssetsStepPage
});
