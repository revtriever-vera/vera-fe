import { useState, type Dispatch, type SetStateAction } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';
import type { CompletedSignIn } from '../api/complete-sign-in';
import { useAdminLogin, type AdminLoginResult } from '../api/use-admin-login.mutation';
import {
    useTotpActivate,
    useTotpVerify,
    type ActivatedSignIn,
    type TotpActivateInput,
    type TotpVerifyInput
} from '../api/use-totp.mutations';
import type { TotpEnrollment } from '../types';
import { requiresNewGoogleLogin } from './admin-totp-error-message';

export type AdminStep =
    | { readonly kind: 'google' }
    | { readonly kind: 'challenge'; readonly challengeToken: string }
    | { readonly kind: 'enrollment'; readonly setupToken: string; readonly enrollment: TotpEnrollment }
    | { readonly kind: 'recovery'; readonly completed: CompletedSignIn; readonly recoveryCodes: readonly string[] };

export interface AdminSignIn {
    readonly step: AdminStep;
    readonly error: Error | null;
    readonly pending: boolean;
    readonly loginWithGoogle: (idToken: string) => void;
    readonly submitChallenge: (code: string) => void;
    readonly submitEnrollment: (code: string) => void;
    readonly finish: () => void;
    readonly restart: () => void;
}

const GOOGLE_STEP: AdminStep = { kind: 'google' };

interface SecondFactorContext {
    readonly step: AdminStep;
    readonly setStep: Dispatch<SetStateAction<AdminStep>>;
    readonly enter: (completed: CompletedSignIn) => void;
    readonly begin: () => void;
    readonly fail: (failure: Error) => void;
}

type SecondFactor = Pick<AdminSignIn, 'submitChallenge' | 'submitEnrollment' | 'finish'> & { readonly pending: boolean };

function useSecondFactor({ step, setStep, enter, begin, fail }: SecondFactorContext): SecondFactor {
    const verify: UseMutationResult<CompletedSignIn, Error, TotpVerifyInput> = useTotpVerify();
    const activate: UseMutationResult<ActivatedSignIn, Error, TotpActivateInput> = useTotpActivate();
    return {
        pending: verify.isPending || activate.isPending,
        submitChallenge: (code: string): void => {
            if (step.kind !== 'challenge') {
                return;
            }
            begin();
            verify.mutate({ challengeToken: step.challengeToken, code }, { onSuccess: enter, onError: fail });
        },
        submitEnrollment: (code: string): void => {
            if (step.kind !== 'enrollment') {
                return;
            }
            begin();
            activate.mutate(
                { setupToken: step.setupToken, code },
                {
                    onSuccess: ({ completed, recoveryCodes }: ActivatedSignIn): void => {
                        setStep({ kind: 'recovery', completed, recoveryCodes });
                    },
                    onError: fail
                }
            );
        },
        finish: (): void => {
            if (step.kind === 'recovery') {
                enter(step.completed);
            }
        }
    };
}

interface StepFailure {
    readonly begin: () => void;
    readonly fail: (failure: Error) => void;
}

function useStepFailure(setStep: Dispatch<SetStateAction<AdminStep>>, setError: Dispatch<SetStateAction<Error | null>>): StepFailure {
    return {
        begin: (): void => {
            setError(null);
        },
        fail: (failure: Error): void => {
            setError(failure);
            if (requiresNewGoogleLogin(failure)) {
                setStep(GOOGLE_STEP);
            }
        }
    };
}

export function useAdminSignIn(): AdminSignIn {
    const { signIn } = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();
    const [step, setStep] = useState<AdminStep>(GOOGLE_STEP);
    const [error, setError] = useState<Error | null>(null);
    const login: UseMutationResult<AdminLoginResult, Error, string> = useAdminLogin();

    const enter = (completed: CompletedSignIn): void => {
        signIn(completed.accessToken, completed.user);
        void navigate({ to: '/admin/audit', replace: true });
    };
    const { begin, fail }: StepFailure = useStepFailure(setStep, setError);
    const secondFactor: SecondFactor = useSecondFactor({ step, setStep, enter, begin, fail });

    return {
        ...secondFactor,
        step,
        error,
        pending: login.isPending || secondFactor.pending,
        loginWithGoogle: (idToken: string): void => {
            begin();
            login.mutate(idToken, {
                onSuccess: (result: AdminLoginResult): void => {
                    if (result.kind === 'signed_in') {
                        enter(result.completed);
                        return;
                    }
                    setStep(result);
                },
                onError: fail
            });
        },
        restart: (): void => {
            begin();
            setStep(GOOGLE_STEP);
        }
    };
}
