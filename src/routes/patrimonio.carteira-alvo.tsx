import { createFileRoute } from '@tanstack/react-router';
import { TargetsPage } from '@/features/portfolio/targets/pages/targets-page';

export const Route = createFileRoute('/patrimonio/carteira-alvo')({
    component: TargetsPage
});
