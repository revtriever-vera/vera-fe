import type { ReactElement } from 'react';

const BOLD_PATTERN: RegExp = /\*\*([^*]+)\*\*/g;

export type ParagraphPart = { readonly bold: boolean; readonly text: string; readonly offset: number };

export function splitParagraph(text: string): readonly ParagraphPart[] {
    const parts: ParagraphPart[] = [];
    let cursor: number = 0;
    for (const match of text.matchAll(BOLD_PATTERN)) {
        if (match.index > cursor) {
            parts.push({ bold: false, text: text.slice(cursor, match.index), offset: cursor });
        }
        parts.push({ bold: true, text: match[1] ?? '', offset: match.index });
        cursor = match.index + match[0].length;
    }
    if (cursor < text.length) {
        parts.push({ bold: false, text: text.slice(cursor), offset: cursor });
    }
    return parts;
}

export function renderParagraph(text: string): ReactElement[] {
    return splitParagraph(text).map((part: ParagraphPart): ReactElement =>
        part.bold ? <strong key={part.offset}>{part.text}</strong> : <span key={part.offset}>{part.text}</span>
    );
}
