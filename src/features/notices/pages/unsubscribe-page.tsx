import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useUnsubscribe } from '../api/use-unsubscribe.mutation';
import { noticeTitleList, noticeTypes } from '../lib/notice-text';
import { noticesErrorMessage } from '../lib/notices-error-message';
import type { UnsubscribeResult } from '../types';

export interface UnsubscribePageProps {
    readonly token: string;
}

function Done({ result }: { readonly result: UnsubscribeResult }): ReactElement {
    const { t, i18n }: UseTranslationResponse<'notices', undefined> = useTranslation('notices');
    const notices: string = noticeTitleList(t, i18n.language, result.type);
    const body: string =
        noticeTypes(result.type).length > 1 ? t('unsubscribe.doneBodyMany', { notices }) : t('unsubscribe.doneBody', { notice: notices });
    return (
        <>
            <h1 className="text-xl font-semibold text-content">{t('unsubscribe.doneTitle')}</h1>
            <p className="text-sm text-content-muted">{body}</p>
            <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
                {t('unsubscribe.openApp')}
            </Link>
        </>
    );
}

export function UnsubscribePage({ token }: UnsubscribePageProps): ReactElement {
    const { t }: UseTranslationResponse<'notices', undefined> = useTranslation('notices');
    const mutation: ReturnType<typeof useUnsubscribe> = useUnsubscribe();

    return (
        <main className="grid min-h-dvh place-items-center bg-surface-muted px-4 py-10">
            <Card className="flex w-full max-w-md flex-col items-start gap-4 p-6">
                <BrandLogo />
                {mutation.data === undefined ? (
                    <>
                        <h1 className="text-xl font-semibold text-content">{t('unsubscribe.title')}</h1>
                        <p className="text-sm text-content-muted">{t('unsubscribe.body')}</p>
                        {mutation.isError ? <Alert title={noticesErrorMessage(t, mutation.error)} /> : null}
                        <Button
                            disabled={mutation.isPending}
                            onClick={(): void => {
                                mutation.mutate(token);
                            }}
                        >
                            {t('unsubscribe.confirm')}
                        </Button>
                    </>
                ) : (
                    <Done result={mutation.data} />
                )}
            </Card>
        </main>
    );
}
