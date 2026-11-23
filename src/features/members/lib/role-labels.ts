import type { MemberRole } from '../types';

export const MEMBER_ROLES: readonly MemberRole[] = ['owner', 'editor', 'viewer'];

export const ROLE_LABEL_KEYS: Readonly<Record<MemberRole, 'roleOwner' | 'roleEditor' | 'roleViewer'>> = {
    owner: 'roleOwner',
    editor: 'roleEditor',
    viewer: 'roleViewer'
};

export const ROLE_HINT_KEYS: Readonly<Record<MemberRole, 'roleOwnerHint' | 'roleEditorHint' | 'roleViewerHint'>> = {
    owner: 'roleOwnerHint',
    editor: 'roleEditorHint',
    viewer: 'roleViewerHint'
};
