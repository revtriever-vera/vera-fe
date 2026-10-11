import type ptBRCommon from './shared/lib/i18n/resources/pt-BR/common.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        returnNull: false;
        resources: {
            common: typeof ptBRCommon;
        };
    }
}
