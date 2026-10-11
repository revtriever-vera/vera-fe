import type { ReactElement } from 'react';
import { ActionsSection, DataSection, DialogsSection, FeedbackSection, FormsSection, StructureSection } from './ui-gallery-sections';

export function UiGalleryPage(): ReactElement {
    return (
        <main data-testid="ui-gallery" className="app-canvas min-h-screen">
            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-page-x py-page-y">
                <h1 className="text-2xl font-extrabold">Componentes da Vera</h1>
                <ActionsSection />
                <FormsSection />
                <FeedbackSection />
                <DialogsSection />
                <DataSection />
                <StructureSection />
            </div>
        </main>
    );
}
