import type { paths } from '@/shared/lib/api/schema';

export type MembersList = paths['/members']['get']['responses']['200']['content']['application/json'];
export type MemberView = MembersList['members'][number];
export type PendingInvite = MembersList['invites'][number];
export type MemberRole = MemberView['role'];
export type InviteResult = paths['/members/invites']['post']['responses']['201']['content']['application/json'];
