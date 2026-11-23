const BRAZIL_CODE: string = '55';
const BRAZIL_PATTERN: RegExp = /^55(\d{2})(\d{4,5})(\d{4})$/;

export function formatPhone(raw: string): string {
    const digits: string = raw.replaceAll(/\D/g, '');
    const match: RegExpExecArray | null = BRAZIL_PATTERN.exec(digits);
    if (match === null || !digits.startsWith(BRAZIL_CODE)) {
        return `+${digits}`;
    }
    return `+${BRAZIL_CODE} ${match[1] ?? ''} ${match[2] ?? ''}-${match[3] ?? ''}`;
}

export function formatClock(iso: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(new Date(iso));
}
