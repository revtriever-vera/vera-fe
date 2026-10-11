import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { useUiLocale, useUiText, type UiText } from './ui-text';

type StaticKey = Exclude<keyof UiText, 'openCalendarFor' | 'requestId'>;

const STATIC_KEYS: readonly StaticKey[] = [
    'previous',
    'next',
    'close',
    'cancel',
    'pleaseWait',
    'previousMonth',
    'nextMonth',
    'datePlaceholder',
    'hidePassword',
    'showPassword',
    'copied',
    'change',
    'dropFileHere',
    'orClickToChoose',
    'fileRejected',
    'dismissAlert'
];

describe('useUiText', () => {
    afterEach(async () => {
        await i18n.changeLanguage('pt-BR');
    });

    it('devolve os textos em pt-BR por padrão', () => {
        const { result } = renderHook((): UiText => useUiText());
        expect(result.current.cancel).toBe('Cancelar');
        expect(result.current.openCalendarFor('De')).toBe('Abrir calendário de De');
        expect(result.current.requestId('abc')).toBe('requestId: abc');
    });

    it('resolve todas as chaves sem cair no nome da chave', () => {
        const { result } = renderHook((): UiText => useUiText());
        for (const key of STATIC_KEYS) {
            expect(typeof result.current[key]).toBe('string');
            expect(result.current[key]).not.toBe(key);
            expect(result.current[key]).not.toBe('');
        }
    });

    it('devolve os textos e o locale em en quando o idioma muda', async () => {
        await i18n.changeLanguage('en');
        const { result } = renderHook(() => ({ text: useUiText(), locale: useUiLocale() }));
        expect(result.current.text.cancel).toBe('Cancel');
        expect(result.current.text.openCalendarFor('From')).toBe('Open calendar for From');
        expect(result.current.locale).toBe('en');
    });
});
