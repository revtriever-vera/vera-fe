import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            environmentOptions: { jsdom: { customExportConditions: [''] } },
            maxWorkers: 4,
            testTimeout: 15_000,
            globals: false,
            setupFiles: ['./test/setup.ts'],
            include: ['src/**/*.spec.{ts,tsx}', 'eslint-rules/**/*.spec.mjs'],
            typecheck: {
                tsconfig: './tsconfig.app.json'
            },
            coverage: {
                provider: 'v8',
                include: ['src/**/*.{ts,tsx}'],
                exclude: ['src/**/*.spec.{ts,tsx}', 'src/routeTree.gen.ts', 'src/**/*.d.ts', 'src/main.tsx'],
                reportsDirectory: 'coverage',
                reporter: ['text-summary', 'json-summary', 'html', 'lcov'],
                thresholds: { lines: 85, branches: 85, functions: 85, statements: 85 }
            }
        }
    })
);
