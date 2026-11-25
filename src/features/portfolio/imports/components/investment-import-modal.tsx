import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { useInvestmentImportFlow, type ImportOutcome, type InvestmentImportFlow } from '../lib/use-investment-import-flow';
import { InvestmentFileStep } from './investment-file-step';
import { InvestmentImportHistory } from './investment-import-history';
import { InvestmentImportResult } from './investment-import-result';
import { InvestmentReviewStep } from './investment-review-step';

function ReviewFooter({ flow, onClose }: { readonly flow: InvestmentImportFlow; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    return (
        <>
            <Button variant="ghost" onClick={onClose}>
                {t('actions.cancel')}
            </Button>
            <Button loading={flow.committing} disabled={!flow.canConfirm} onClick={flow.commit}>
                {flow.committing ? t('actions.confirming') : t('actions.confirm')}
            </Button>
        </>
    );
}

function ResultFooter({ onAnother, onClose }: { readonly onAnother: () => void; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    return (
        <>
            <Button variant="ghost" onClick={onAnother}>
                {t('actions.another')}
            </Button>
            <Link to="/portfolio/assets" className={buttonVariants()} onClick={onClose}>
                {t('actions.viewAssets')}
            </Link>
        </>
    );
}

function Footer({
    flow,
    outcome,
    onClose
}: {
    readonly flow: InvestmentImportFlow;
    readonly outcome: ImportOutcome | null;
    readonly onClose: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    if (outcome !== null) {
        return <ResultFooter onAnother={flow.restart} onClose={onClose} />;
    }
    if (flow.preview !== null) {
        return <ReviewFooter flow={flow} onClose={onClose} />;
    }
    return (
        <Button variant="ghost" onClick={onClose}>
            {t('actions.close')}
        </Button>
    );
}

function Content({ flow }: { readonly flow: InvestmentImportFlow }): ReactElement {
    if (flow.outcome !== null) {
        return <InvestmentImportResult outcome={flow.outcome} />;
    }
    return (
        <div className="flex flex-col gap-5">
            <InvestmentFileStep flow={flow} />
            {flow.preview === null ? <InvestmentImportHistory /> : <InvestmentReviewStep flow={flow} />}
        </div>
    );
}

export function InvestmentImportModal({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const flow: InvestmentImportFlow = useInvestmentImportFlow();
    return (
        <Modal
            title={t('modal.title')}
            description={t('modal.description')}
            onClose={onClose}
            size="wide"
            fullOnMobile
            footer={<Footer flow={flow} outcome={flow.outcome} onClose={onClose} />}
        >
            <Content flow={flow} />
        </Modal>
    );
}
