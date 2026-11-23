import type { ReactElement } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { useInviteForm, type InviteForm } from '../lib/use-invite-form';
import { RoleSelect } from './role-select';
import { SectionCard } from './section-card';

export function InviteCard(): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const { form, busy, submit }: InviteForm = useInviteForm();

    return (
        <SectionCard title={t('inviteTitle')} description={t('inviteBody')}>
            <form noValidate onSubmit={(event): void => void submit(event)} className="flex flex-col gap-3">
                <Field
                    label={t('inviteEmailLabel')}
                    type="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    error={form.formState.errors.email?.message}
                    {...form.register('email')}
                />
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-content">{t('inviteRoleLabel')}</span>
                    <Controller
                        control={form.control}
                        name="role"
                        render={({ field }): ReactElement => (
                            <RoleSelect label={t('inviteRoleLabel')} value={field.value} onChange={field.onChange} className="min-h-11" />
                        )}
                    />
                </div>
                <p className="text-xs text-content-muted">{t('inviteRolesNote')}</p>
                <div>
                    <Button type="submit" loading={busy}>
                        {t('inviteSubmit')}
                    </Button>
                </div>
            </form>
        </SectionCard>
    );
}
