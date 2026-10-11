import type { ReactElement } from 'react';
import { env } from '@/shared/config/env';

export function LoginHero(): ReactElement {
    return (
        <div aria-hidden="true" className="relative overflow-hidden">
            <div className="login-photo-placeholder absolute inset-0" />
            {env.VITE_LOGIN_PHOTO_URL === '' ? null : (
                <img
                    src={env.VITE_LOGIN_PHOTO_URL}
                    alt=""
                    className="absolute inset-0 size-full max-w-none object-cover object-[55%_30%]"
                />
            )}
            <div className="login-photo-overlay absolute inset-0" />
            <div className="absolute bottom-7 left-7 hidden size-14 place-items-center rounded-2xl bg-accent-contrast/20 text-accent-contrast backdrop-blur-sm min-[861px]:grid">
                <svg width="30" height="30" viewBox="0 0 24 24">
                    <path
                        d="M4.8 6 L12 19.2 L19.2 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="12" cy="8.6" r="2.2" fill="currentColor" />
                </svg>
            </div>
        </div>
    );
}
