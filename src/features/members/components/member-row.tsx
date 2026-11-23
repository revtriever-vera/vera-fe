import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { inviteDaysLeft, inviteExpired } from '../lib/invite-days';
import type { PersonRow } from '../lib/person-rows';
import { ROLE_HINT_KEYS, ROLE_LABEL_KEYS } from '../lib/role-labels';
import type { MemberRole } from '../types';
import { RoleSelect } from './role-select';

export interface MemberRowProps {
    readonly person: PersonRow;
    readonly canManage: boolean;
    readonly roleLocked: boolean;
    readonly busy: boolean;
    readonly onChangeRole: (role: MemberRole) => void;
    readonly onResend: () => void;
    readonly onRemove: () => void;
}

function inviteDetail(t: TFunction<'members'>, person: PersonRow): string {
    if (person.expiresAt === null) {
        return t(ROLE_HINT_KEYS[person.role]);
    }
    return inviteExpired(person.expiresAt) ? t('inviteExpired') : t('inviteValidity', { count: inviteDaysLeft(person.expiresAt) });
}

function RowDetail({ person }: { readonly person: PersonRow }): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const detail: string = inviteDetail(t, person);

    return (
        <p className="truncate text-xs text-content-muted">
            {person.email !== null && !person.pending ? `${person.email} · ` : ''}
            {detail}
        </p>
    );
}

function RowActions({ person, busy, onResend, onRemove }: Pick<MemberRowProps, 'person' | 'busy' | 'onResend' | 'onRemove'>): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');

    return (
        <div className="flex gap-2">
            {person.pending ? (
                <Button type="button" variant="secondary" size="sm" className="min-h-11" disabled={busy} onClick={onResend}>
                    {t('resend')}
                </Button>
            ) : null}
            {person.isYou ? null : (
                <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={onRemove}>
                    {t('remove')}
                </Button>
            )}
        </div>
    );
}

export function MemberRow({ person, canManage, roleLocked, busy, onChangeRole, onResend, onRemove }: MemberRowProps): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');

    return (
        <li className="flex flex-col gap-3 py-3 min-[561px]:flex-row min-[561px]:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={person.name} className="size-9" />
                <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-content">
                        <span className="truncate">{person.name}</span>
                        {person.isYou ? <Badge tone="accent">{t('you')}</Badge> : null}
                        {person.pending ? <Badge tone="caution">{t('invitePending')}</Badge> : null}
                    </p>
                    <RowDetail person={person} />
                </div>
            </div>
            {canManage ? (
                <div className="flex flex-wrap items-center gap-2">
                    <RoleSelect
                        label={t('roleOf', { name: person.name })}
                        value={person.role}
                        disabled={roleLocked || busy || person.pending}
                        className="min-h-11 w-36"
                        onChange={onChangeRole}
                    />
                    <RowActions person={person} busy={busy} onResend={onResend} onRemove={onRemove} />
                </div>
            ) : (
                <Badge>{t(ROLE_LABEL_KEYS[person.role])}</Badge>
            )}
        </li>
    );
}
