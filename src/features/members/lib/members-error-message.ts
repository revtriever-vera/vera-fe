import type { TFunction } from 'i18next';
import type ptBRMembers from '@/shared/lib/i18n/resources/pt-BR/members.json';
import { ApiError } from '@/shared/lib/api/api-error';

type MembersDictionary = typeof ptBRMembers;

type MembersKey = { [K in keyof MembersDictionary]: MembersDictionary[K] extends string ? K : never }[keyof MembersDictionary];

const TOO_MANY_REQUESTS: number = 429;

const ERROR_KEYS: Readonly<Record<string, MembersKey>> = {
    'invites.already_member': 'errorAlreadyMember',
    'members.limit_reached': 'errorLimitReached',
    'members.last_owner': 'errorLastOwner',
    'members.forbidden_role': 'errorForbiddenRole',
    'members.not_found': 'errorNotFound',
    'invites.not_found': 'errorInviteNotFound',
    'core.too_many_attempts': 'errorTooManyAttempts'
};

export function membersErrorMessage(t: TFunction<'members'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errorGeneric');
    }
    const code: string = error.status === TOO_MANY_REQUESTS ? 'core.too_many_attempts' : error.problem.type;
    return t(ERROR_KEYS[code] ?? 'errorGeneric');
}
