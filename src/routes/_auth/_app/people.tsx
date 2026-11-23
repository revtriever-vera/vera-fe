import { createFileRoute } from '@tanstack/react-router';
import { MembersPage } from '@/features/members/pages/members-page';

export const Route = createFileRoute('/_auth/_app/people')({
    component: MembersPage
});
