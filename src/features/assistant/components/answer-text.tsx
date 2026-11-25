import { Link } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { splitAnswer, splitParagraphs, type AnswerPart } from '../lib/answer-parts';

function Part({ part }: { readonly part: AnswerPart }): ReactElement {
    if (part.kind === 'bold') {
        return <strong className="font-semibold">{part.text}</strong>;
    }
    if (part.kind === 'link') {
        return (
            <Link to={part.href} className="font-medium text-accent-strong underline underline-offset-2">
                {part.text}
            </Link>
        );
    }
    return <>{part.text}</>;
}

export function AnswerText({ text }: { readonly text: string }): ReactElement {
    return (
        <>
            {splitParagraphs(text).map((paragraph: string): ReactElement => (
                <p key={paragraph} className="m-0 whitespace-pre-line">
                    {splitAnswer(paragraph).map((part: AnswerPart): ReactElement => (
                        <Part key={part.offset} part={part} />
                    ))}
                </p>
            ))}
        </>
    );
}
