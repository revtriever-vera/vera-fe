import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { InvitePage } from '@/features/auth/pages/invite-page';

function InviteRoute(): ReactElement {
    const { token }: { token: string } = Route.useParams();
    return <InvitePage token={token} />;
}

export const Route = createFileRoute('/convite/$token')({
    component: InviteRoute
});
