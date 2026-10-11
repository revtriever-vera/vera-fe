import { i18n } from '@/shared/lib/i18n';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/shared/lib/locale';
import { isSystemClassKey } from '../../lib/class-icons';
import type { AssetClassView } from '../../types';

export const CLASS_NAME_MAX_LENGTH: number = 40;
export const CLASS_LIMIT: number = 30;

export function normalizeClassName(name: string): string {
    return name.trim().toLowerCase();
}

function defaultNames(systemKey: string): readonly string[] {
    if (!isSystemClassKey(systemKey)) {
        return [];
    }
    return SUPPORTED_LOCALES.map((locale: SupportedLocale): string => i18n.getFixedT(locale, 'portfolio')(`classes.names.${systemKey}`));
}

function namesOf(assetClass: AssetClassView): readonly string[] {
    if (assetClass.name !== null) {
        return [assetClass.name];
    }
    return assetClass.systemKey === null ? [] : defaultNames(assetClass.systemKey);
}

export function takenClassNames(classes: readonly AssetClassView[], ignoreClassId: string | null): readonly string[] {
    return classes
        .filter((assetClass: AssetClassView): boolean => assetClass.id !== ignoreClassId)
        .flatMap(namesOf)
        .map(normalizeClassName);
}
