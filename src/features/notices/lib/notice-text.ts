import type { TFunction } from 'i18next';
import { isKnownNoticeType } from './notice-types';

export function noticeTitle(t: TFunction<'notices'>, type: string): string {
    return isKnownNoticeType(type) ? t(`types.${type}.title`) : t('types.other.title');
}

export function noticeDescription(t: TFunction<'notices'>, type: string): string {
    return isKnownNoticeType(type) ? t(`types.${type}.description`) : t('types.other.description');
}
