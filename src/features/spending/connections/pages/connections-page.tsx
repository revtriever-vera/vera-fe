import type { ReactElement } from 'react';
import { UnderConstruction } from '../../components/under-construction';
import { ImportCard } from '../../imports/components/import-card';

export function ConnectionsPage(): ReactElement {
    return (
        <div className="flex flex-col gap-4">
            <UnderConstruction />
            <ImportCard />
        </div>
    );
}
