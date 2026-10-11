import { createFileRoute } from '@tanstack/react-router';
import { RequireSession } from '@/features/auth/components/require-session';

export const Route = createFileRoute('/_auth')({
    component: RequireSession
});
