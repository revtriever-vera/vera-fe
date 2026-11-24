import type { ReactElement, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import type { CatalogGroup } from '../types';

const CVM_OPEN_DATA_URL: string = 'https://dados.cvm.gov.br/';
const CVM_GROUPS: ReadonlySet<CatalogGroup> = new Set<CatalogGroup>(['acoes_br', 'fii', 'fundos']);

function CvmLink({ children }: { readonly children?: ReactNode }): ReactElement {
    return (
        <a
            href={CVM_OPEN_DATA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-content underline underline-offset-2"
        >
            {children}
        </a>
    );
}

export function CatalogSourceNote({ group }: { readonly group: CatalogGroup }): ReactElement | null {
    if (!CVM_GROUPS.has(group)) {
        return null;
    }
    return (
        <p className="text-xs leading-normal text-content-muted">
            <Trans i18nKey="search.source" ns="portfolioAssets" components={{ cvm: <CvmLink /> }} />
        </p>
    );
}
