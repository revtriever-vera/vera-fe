import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Avatar, initialOf } from './avatar';

describe('initialOf', () => {
    it.each([
        ['Maria Teste', 'M'],
        ['  joão', 'J'],
        ['Ágata', 'Á'],
        ['😀 Sorriso', '😀'],
        ['X', 'X'],
        ['', '?'],
        ['   ', '?']
    ])('takes the initial of %j', (name: string, expected: string) => {
        expect(initialOf(name)).toBe(expected);
    });
});

describe('Avatar', () => {
    it('shows the initial and stays hidden from assistive technology', () => {
        const { container } = render(<Avatar name="Ágata" />);

        expect(container.firstElementChild).toHaveTextContent('Á');
        expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    });
});
