import { describe, expect, it } from 'vitest';
import { ana, member, membersList, pendingInvite } from '../../../../test/fixtures/members';
import { inviteDaysLeft, inviteExpired } from './invite-days';
import { isOnlyOwner, toPersonRows, type PersonRow } from './person-rows';

function rowsOf(list: Parameters<typeof toPersonRows>[0]): readonly PersonRow[] {
    return toPersonRows(list);
}

function only(rows: readonly PersonRow[], index: number): PersonRow {
    const row: PersonRow | undefined = rows[index];
    if (row === undefined) {
        throw new Error('row missing');
    }
    return row;
}

describe('toPersonRows', () => {
    it('lists active people first and pending invites after, named by their e-mail', (): void => {
        const rows: readonly PersonRow[] = rowsOf(membersList());

        expect(rows.map((row: PersonRow): [string, boolean] => [row.name, row.pending])).toEqual([
            ['Maria Teste', false],
            ['Ana Souza', false],
            ['ana@exemplo.com', true]
        ]);
    });
});

describe('isOnlyOwner', () => {
    it('is true when one active owner exists', (): void => {
        const rows: readonly PersonRow[] = rowsOf(membersList({ members: [member(), ana()], invites: [] }));

        expect(isOnlyOwner(rows, only(rows, 0))).toBe(true);
    });

    it('is false with two owners, and ignores pending invites', (): void => {
        const two: readonly PersonRow[] = rowsOf(membersList({ members: [member(), ana({ role: 'owner' })], invites: [] }));
        const pending: readonly PersonRow[] = rowsOf(membersList({ members: [member()], invites: [pendingInvite({ role: 'owner' })] }));

        expect(isOnlyOwner(two, only(two, 0))).toBe(false);
        expect(isOnlyOwner(pending, only(pending, 0))).toBe(true);
        expect(isOnlyOwner(pending, only(pending, 1))).toBe(false);
    });
});

describe('inviteDaysLeft', () => {
    it('rounds up and never goes below one day', (): void => {
        const now: number = Date.parse('2026-11-20T12:00:00.000Z');

        expect(inviteDaysLeft('2026-11-27T11:00:00.000Z', now)).toBe(7);
        expect(inviteDaysLeft('2026-11-19T12:00:00.000Z', now)).toBe(1);
    });
});

describe('inviteExpired', () => {
    it('is true once the expiry has passed', (): void => {
        const now: number = Date.parse('2026-11-20T12:00:00.000Z');

        expect(inviteExpired('2026-11-19T12:00:00.000Z', now)).toBe(true);
        expect(inviteExpired('2026-11-20T12:00:00.000Z', now)).toBe(true);
        expect(inviteExpired('2026-11-20T12:00:01.000Z', now)).toBe(false);
    });
});
