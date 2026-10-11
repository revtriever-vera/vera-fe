import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { initialsOf } from '../lib/initials';

export type InstitutionAvatarSize = 'sm' | 'md';

export interface InstitutionAvatarProps {
    readonly name: string | null;
    readonly logoUrl: string | null;
    readonly size?: InstitutionAvatarSize;
}

const BOX: Readonly<Record<InstitutionAvatarSize, string>> = {
    sm: 'size-5 text-[9px]',
    md: 'size-10 text-sm'
};

const SHELL: string = 'flex shrink-0 items-center justify-center overflow-hidden rounded-control';

export function InstitutionAvatar({ name, logoUrl, size = 'md' }: InstitutionAvatarProps): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    if (logoUrl !== null && failedUrl !== logoUrl) {
        return (
            <span className={cn(SHELL, BOX[size], 'bg-surface')}>
                <img
                    src={logoUrl}
                    alt={t('institution.logoAlt', { name: name ?? t('institution.unknown') })}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="size-full object-contain"
                    onError={(): void => {
                        setFailedUrl(logoUrl);
                    }}
                />
            </span>
        );
    }
    return (
        <span aria-hidden="true" className={cn(SHELL, BOX[size], 'bg-accent/10 font-bold text-accent-strong')}>
            {initialsOf(name)}
        </span>
    );
}
