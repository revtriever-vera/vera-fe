export type AnswerPart =
    | { readonly kind: 'text'; readonly text: string; readonly offset: number }
    | { readonly kind: 'bold'; readonly text: string; readonly offset: number }
    | { readonly kind: 'link'; readonly text: string; readonly href: string; readonly offset: number };

const TOKEN_PATTERN: RegExp = /\*\*([^*]{1,300})\*\*|\[([^\]]{1,200})\]\((\/(?!\/)[^)\s]{0,300})\)/g;

export function splitAnswer(line: string): readonly AnswerPart[] {
    const parts: AnswerPart[] = [];
    let cursor: number = 0;
    for (const match of line.matchAll(TOKEN_PATTERN)) {
        if (match.index > cursor) {
            parts.push({ kind: 'text', text: line.slice(cursor, match.index), offset: cursor });
        }
        const [, bold, label, href] = match;
        parts.push(
            bold === undefined
                ? { kind: 'link', text: label ?? '', href: href ?? '/', offset: match.index }
                : { kind: 'bold', text: bold, offset: match.index }
        );
        cursor = match.index + match[0].length;
    }
    if (cursor < line.length) {
        parts.push({ kind: 'text', text: line.slice(cursor), offset: cursor });
    }
    return parts;
}

export function splitParagraphs(text: string): readonly string[] {
    return text
        .split(/\n{2,}/)
        .map((paragraph: string): string => paragraph.trim())
        .filter((paragraph: string): boolean => paragraph !== '');
}
