import type { ReactElement, ReactNode } from 'react';
import {
    ActionsSection,
    DataSection,
    DialogsSection,
    FeedbackSection,
    FormsSection,
    SelectionSection,
    StructureSection
} from './ui-gallery-sections';

export function UiGalleryPage({ children }: { readonly children?: ReactNode }): ReactElement {
    return (
        <main data-testid="ui-gallery" className="app-canvas min-h-screen">
            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-page-x py-page-y">
                <h1 className="text-2xl font-extrabold">Componentes da Vera</h1>
                <ActionsSection />
                <FormsSection />
                <FeedbackSection />
                <DialogsSection />
                <DataSection />
                <SelectionSection />
                <StructureSection />
                {children}
            </div>
        </main>
    );
}
