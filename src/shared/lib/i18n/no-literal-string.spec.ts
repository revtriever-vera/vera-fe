import { ESLint, type Linter } from 'eslint';
import i18next from 'eslint-plugin-i18next';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

const RULE: string = 'i18next/no-literal-string';

async function repoRuleEntry(): Promise<Linter.RuleEntry> {
    const resolved: Linter.Config = (await new ESLint({ cwd: process.cwd() }).calculateConfigForFile(
        'src/routes/index.tsx'
    )) as Linter.Config;
    const entry: Linter.RuleEntry | undefined = resolved.rules?.[RULE];
    if (entry === undefined || entry === 'off' || entry === 0) {
        throw new Error(`${RULE} não está ligada no eslint.config.mjs`);
    }
    return entry;
}

const eslint: ESLint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
        {
            files: ['**/*.tsx'],
            languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
            plugins: { i18next },
            rules: { [RULE]: await repoRuleEntry() }
        }
    ]
});

async function literalStringErrors(code: string): Promise<number> {
    const [result] = await eslint.lintText(code, { filePath: 'fixture.tsx' });
    const messages: Linter.LintMessage[] = result?.messages ?? [];
    expect(messages.filter((message: Linter.LintMessage): boolean => message.fatal === true)).toEqual([]);
    return messages.filter((message: Linter.LintMessage): boolean => message.ruleId === RULE).length;
}

describe(RULE, () => {
    it('barra texto solto no JSX', async () => {
        expect(await literalStringErrors('export const Page = () => <button>Salvar</button>;')).toBe(1);
    });

    it('barra texto solto em props de interface', async () => {
        expect(await literalStringErrors('export const Page = () => <input placeholder="Nome" aria-label="Busca" />;')).toBe(2);
    });

    it('aceita texto vindo de t()', async () => {
        expect(await literalStringErrors("export const Page = (t: (k: string) => string) => <button>{t('common:save')}</button>;")).toBe(0);
    });

    it('ignora atributos técnicos', async () => {
        expect(await literalStringErrors('export const Page = () => <div className="flex" data-testid="x" role="status" />;')).toBe(0);
    });
});
