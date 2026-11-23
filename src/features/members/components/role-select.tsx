import { useId, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';
import { MEMBER_ROLES, ROLE_LABEL_KEYS } from '../lib/role-labels';
import type { MemberRole } from '../types';

interface RoleSelectProps {
    readonly label: string;
    readonly value: MemberRole;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly onChange: (role: MemberRole) => void;
}

function toRole(value: string): MemberRole | undefined {
    return MEMBER_ROLES.find((role: MemberRole): boolean => role === value);
}

export function RoleSelect({ label, value, disabled, className, onChange }: RoleSelectProps): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const labelId: string = useId();
    const choices: readonly SelectChoice[] = MEMBER_ROLES.map((role: MemberRole): SelectChoice => ({
        value: role,
        label: t(ROLE_LABEL_KEYS[role]),
        warning: null
    }));

    return (
        <>
            <span id={labelId} className="sr-only">
                {label}
            </span>
            <SelectMenu
                value={value}
                choices={choices}
                placeholder={t('rolePlaceholder')}
                ariaLabelledBy={labelId}
                disabled={disabled}
                className={className}
                onChange={(next: string): void => {
                    const role: MemberRole | undefined = toRole(next);
                    if (role !== undefined) {
                        onChange(role);
                    }
                }}
            />
        </>
    );
}
