import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';
import rules from './no-fixed-color.mjs';

const ruleTester = new RuleTester({
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } }
    }
});

describe('local/no-fixed-color', () => {
    it('reporta e aceita os casos do card', () => {
        ruleTester.run('no-fixed-color', rules.rules['no-fixed-color'], {
            valid: [
                { code: 'const Page = () => <div className="bg-[length:var(--w)] w-[calc(100%-2rem)]" />;' },
                { code: 'const Page = () => <div className="bg-surface" />;' },
                { code: 'const Page = () => <div style={{ color: "var(--color-accent)" }} />;' },
                { code: "const classes = cn('bg-surface', condition && 'text-accent');" },
                {
                    code: "const buttonVariants = cva('rounded-control', { variants: { tone: { critical: 'bg-critical text-white' } } });"
                }
            ],
            invalid: [
                {
                    code: 'const Page = () => <div className="bg-[color:#fff]" />;',
                    errors: [{ messageId: 'className' }]
                },
                {
                    code: "const classes = cn('text-[color:rgb(0,0,0)]');",
                    errors: [{ messageId: 'className' }]
                },
                {
                    code: 'const Page = () => <div className="bg-[#fff]" />;',
                    errors: [{ messageId: 'className' }]
                },
                {
                    code: 'const Page = () => <div style={{ color: "#000" }} />;',
                    errors: [{ messageId: 'style' }]
                },
                {
                    code: "const classes = cn('flex', active && 'bg-[rgb(0,0,0)]');",
                    errors: [{ messageId: 'className' }]
                },
                {
                    code: "const buttonVariants = cva('rounded-control', { variants: { tone: { critical: 'bg-[#ff0000]' } } });",
                    errors: [{ messageId: 'className' }]
                }
            ]
        });
    });
});
