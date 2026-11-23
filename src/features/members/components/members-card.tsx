import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import { isOnlyOwner, type PersonRow } from '../lib/person-rows';
import { useMemberActions, type MemberActions } from '../lib/use-member-actions';
import { MemberRow } from './member-row';
import { RemoveMemberDialog } from './remove-member-dialog';
import { SectionCard } from './section-card';

interface MembersCardProps {
    readonly rows: readonly PersonRow[];
    readonly canManage: boolean;
}

export function MembersCard({ rows, canManage }: MembersCardProps): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const actions: MemberActions = useMemberActions();
    const [target, setTarget] = useState<PersonRow | null>(null);

    return (
        <SectionCard
            title={t('listTitle')}
            description={t('listBody')}
            aside={<Badge>{t('peopleCount', { count: rows.length })}</Badge>}
        >
            <ul className="divide-y divide-border">
                {rows.map(
                    (person: PersonRow): ReactElement => (
                        <MemberRow
                            key={person.id}
                            person={person}
                            canManage={canManage}
                            roleLocked={person.isYou && isOnlyOwner(rows, person)}
                            busy={actions.busy}
                            onChangeRole={(role): void => {
                                actions.changeRole(person, role);
                            }}
                            onResend={(): void => {
                                actions.resend(person);
                            }}
                            onRemove={(): void => {
                                setTarget(person);
                            }}
                        />
                    )
                )}
            </ul>
            {target === null ? null : (
                <RemoveMemberDialog
                    person={target}
                    onClose={(): void => {
                        setTarget(null);
                    }}
                />
            )}
        </SectionCard>
    );
}
