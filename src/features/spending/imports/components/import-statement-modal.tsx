import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import type { ImportCreated } from '../../types';
import { useImportFlow, type ImportFlow } from '../lib/use-import-flow';
import { FileStep, IMPORT_FORM_ID } from './file-step';
import { ImportResult } from './import-result';

function canImport(flow: ImportFlow): boolean {
    const { preview } = flow;
    if (preview === null || preview.rows === 0 || flow.previewing) {
        return false;
    }
    return preview.format !== 'csv_generic' || flow.mapping !== null;
}

function FileFooter({ flow, onClose }: { readonly flow: ImportFlow; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    return (
        <>
            <Button variant="ghost" onClick={onClose}>
                {t('actions.cancel')}
            </Button>
            <Button type="submit" form={IMPORT_FORM_ID} loading={flow.committing} disabled={!canImport(flow)}>
                {flow.committing ? t('actions.importing') : t('actions.import', { count: flow.preview?.rows ?? 0 })}
            </Button>
        </>
    );
}

function ResultFooter({ created, onAnother }: { readonly created: ImportCreated; readonly onAnother: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const month: string | undefined = created.periodEnd?.slice(0, 7);
    return (
        <>
            <Button variant="ghost" onClick={onAnother}>
                {t('actions.importAnother')}
            </Button>
            <Link to="/spending/transactions" search={{ accountId: created.accountId, month }} className={buttonVariants()}>
                {t('actions.viewTransactions')}
            </Link>
        </>
    );
}

export function ImportStatementModal({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const flow: ImportFlow = useImportFlow();
    return (
        <Modal
            title={t('modal.title')}
            description={t('modal.description')}
            onClose={onClose}
            size="wide"
            fullOnMobile
            footer={
                flow.result === null ? (
                    <FileFooter flow={flow} onClose={onClose} />
                ) : (
                    <ResultFooter created={flow.result} onAnother={flow.restart} />
                )
            }
        >
            {flow.result === null ? <FileStep flow={flow} /> : <ImportResult created={flow.result} />}
        </Modal>
    );
}
