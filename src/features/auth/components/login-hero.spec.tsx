import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LoginHero } from './login-hero';

const mocks: { env: Record<string, string> } = vi.hoisted(() => ({ env: { VITE_LOGIN_PHOTO_URL: '' } }));

vi.mock('@/shared/config/env', () => ({ env: mocks.env }));

describe('LoginHero', () => {
    beforeEach((): void => {
        mocks.env['VITE_LOGIN_PHOTO_URL'] = '';
    });

    it('shows the bundled photo under the pink overlay without a photo url', () => {
        const { container } = render(<LoginHero />);

        expect(container.querySelector('img')?.getAttribute('src')).toMatch(/vera-login.*\.jpg$/);
        expect(container.querySelector('.login-photo-placeholder')).toBeInTheDocument();
        expect(container.querySelector('.login-photo-overlay')).toBeInTheDocument();
    });

    it('puts the configured photo over the gradient', () => {
        mocks.env['VITE_LOGIN_PHOTO_URL'] = 'https://example.test/foto.jpg';

        const { container } = render(<LoginHero />);

        expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.test/foto.jpg');
        expect(container.querySelector('.login-photo-placeholder')).toBeInTheDocument();
    });
});
