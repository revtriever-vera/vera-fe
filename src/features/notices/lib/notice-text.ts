import type { TFunction } from 'i18next';
import { isKnownNoticeType } from './notice-types';

export function noticeTitle(t: TFunction<'notices'>, type: string): string {
    return isKnownNoticeType(type) ? t(`types.${type}.title`) : t('types.other.title');
}

export function noticeDescription(t: TFunction<'notices'>, type: string): string {
    return isKnownNoticeType(type) ? t(`types.${type}.description`) : t('types.other.description');
}

export function noticeTypes(type: string): readonly string[] {
    const parts: readonly string[] = type
        .split(',')
        .map((part: string): string => part.trim())
        .filter((part: string): boolean => part.length > 0);
    return parts.length === 0 ? [type] : [...new Set(parts)];
}

export function noticeTitleList(t: TFunction<'notices'>, locale: string, type: string): string {
    const titles: string[] = [...new Set(noticeTypes(type).map((item: string): string => noticeTitle(t, item)))];
    return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(titles);
}
