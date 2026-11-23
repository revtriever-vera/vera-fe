import type { ReactElement } from 'react';
import { renderParagraph } from '../lib/render-paragraph';

export function SummaryText({ paragraphs }: { readonly paragraphs: readonly string[] }): ReactElement {
    return (
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-content">
            {paragraphs.map((paragraph: string): ReactElement => (
                <p key={paragraph} className="m-0">
                    {renderParagraph(paragraph)}
                </p>
            ))}
        </div>
    );
}
