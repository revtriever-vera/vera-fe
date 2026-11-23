import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { UnsubscribePage } from '@/features/notices/pages/unsubscribe-page';

function UnsubscribeRoute(): ReactElement {
    const { token }: { token: string } = Route.useParams();
    return <UnsubscribePage token={token} />;
}

export const Route = createFileRoute('/avisos/sair/$token')({
    component: UnsubscribeRoute
});
