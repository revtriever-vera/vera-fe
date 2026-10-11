import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { useUiLocale, useUiText, type UiText } from './ui-text';

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

    it('devolve os textos e o locale em en quando o idioma muda', async () => {
        await i18n.changeLanguage('en');
        const { result } = renderHook(() => ({ text: useUiText(), locale: useUiLocale() }));
        expect(result.current.text.cancel).toBe('Cancel');
        expect(result.current.text.openCalendarFor('From')).toBe('Open calendar for From');
        expect(result.current.locale).toBe('en');
    });
});
