import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { RoleGate } from '@/app/providers/role-gate';
import { useRole } from '@/app/providers/use-role';
import { Alert } from '@/shared/ui/alert';
import { SkeletonPanel } from '@/shared/ui/skeleton-form';
import { useMembers } from '../api/use-members.query';
import { InviteCard } from '../components/invite-card';
import { LeaveCard } from '../components/leave-card';
import { MembersCard } from '../components/members-card';
import { isOnlyOwner, toPersonRows, type PersonRow } from '../lib/person-rows';
import { membersErrorMessage } from '../lib/members-error-message';
import type { MembersList } from '../types';

function MembersContent({ list }: { readonly list: MembersList }): ReactElement {
    const { isOwner } = useRole();
    const rows: readonly PersonRow[] = toPersonRows(list);
    const you: PersonRow | undefined = rows.find((row: PersonRow): boolean => row.isYou);

    return (
        <>
            <MembersCard rows={rows} canManage={isOwner} />
            <RoleGate min="owner">
                <InviteCard />
            </RoleGate>
            <LeaveCard onlyOwner={you !== undefined && isOnlyOwner(rows, you)} />
        </>
    );
}

export function MembersPage(): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const members: UseQueryResult<MembersList> = useMembers();

    return (
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 min-[861px]:py-10">
            <h1 className="text-xl font-semibold tracking-tight text-content">{t('title')}</h1>
            {members.isPending ? <SkeletonPanel label={t('loading')} lines={4} /> : null}
            {members.error ? <Alert title={membersErrorMessage(t, members.error)} /> : null}
            {members.data ? <MembersContent list={members.data} /> : null}
        </main>
    );
}
