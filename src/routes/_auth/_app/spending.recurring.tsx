import { createFileRoute } from '@tanstack/react-router';
import { RecurringPage } from '@/features/spending/recurring/pages/recurring-page';

export const Route = createFileRoute('/_auth/_app/spending/recurring')({
    component: RecurringPage
});
