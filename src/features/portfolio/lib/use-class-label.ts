import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { isSystemClassKey } from './class-icons';

export type ClassLabel = (systemKey: string | null, name: string | null) => string;

export function useClassLabel(): ClassLabel {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    return (systemKey: string | null, name: string | null): string => {
        if (name !== null) {
            return name;
        }
        return systemKey !== null && isSystemClassKey(systemKey) ? t(`classes.names.${systemKey}`) : t('classes.customName');
    };
}
