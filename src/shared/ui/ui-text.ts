import type { SupportedLocale } from '@/shared/lib/locale';
import { DEFAULT_LOCALE } from '@/shared/lib/locale';

export interface UiText {
    readonly previous: string;
    readonly next: string;
    readonly close: string;
    readonly cancel: string;
    readonly pleaseWait: string;
    readonly previousMonth: string;
    readonly nextMonth: string;
    readonly openCalendarFor: (label: string) => string;
    readonly datePlaceholder: string;
    readonly hidePassword: string;
    readonly showPassword: string;
    readonly copied: string;
    readonly change: string;
    readonly dropFileHere: string;
    readonly orClickToChoose: string;
    readonly fileRejected: string;
    readonly requestId: (value: string) => string;
    readonly dismissAlert: string;
}

const PT_BR_TEXT: UiText = {
    previous: 'Anterior',
    next: 'Próxima',
    close: 'Fechar',
    cancel: 'Cancelar',
    pleaseWait: 'Aguarde…',
    previousMonth: 'Mês anterior',
    nextMonth: 'Próximo mês',
    openCalendarFor: (label: string): string => `Abrir calendário de ${label}`,
    datePlaceholder: 'dd/mm/aaaa',
    hidePassword: 'Ocultar senha',
    showPassword: 'Mostrar senha',
    copied: 'Copiado',
    change: 'Trocar',
    dropFileHere: 'Arraste o arquivo aqui',
    orClickToChoose: 'ou clique para escolher',
    fileRejected: 'Arquivo recusado — confira o formato e o tamanho.',
    requestId: (value: string): string => `requestId: ${value}`,
    dismissAlert: 'Fechar aviso'
};

export function useUiText(): UiText {
    return PT_BR_TEXT;
}

export function useUiLocale(): SupportedLocale {
    return DEFAULT_LOCALE;
}
