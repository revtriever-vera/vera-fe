import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PeopleProvider } from '@/features/portfolio/components/people-provider';
import { PortfolioLayout } from '@/features/portfolio/pages/portfolio-layout';
import type { PortfolioPerson } from '@/features/portfolio/lib/holder-filter';
import { useMembers } from '@/features/members/api/use-members.query';
import type { MemberView, MembersList } from '@/features/members/types';

function PortfolioRoute(): ReactElement {
    const members: UseQueryResult<MembersList> = useMembers();
    const people: readonly PortfolioPerson[] = (members.data?.members ?? []).map((member: MemberView): PortfolioPerson => ({
        userId: member.userId,
        name: member.name
    }));
    return (
        <PeopleProvider people={people}>
            <PortfolioLayout />
        </PeopleProvider>
    );
}

export const Route = createFileRoute('/_auth/_app/portfolio')({
    component: PortfolioRoute
});
