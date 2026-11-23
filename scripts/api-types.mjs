// Gera src/shared/lib/api/schema.d.ts a partir do documento do `npm run openapi:dump` do vera-api.
// Uso: npm run api:types [-- caminho/do/openapi.json]  (padrão: ../vera-api/openapi.json)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const input = process.argv[2] ?? process.env.OPENAPI_JSON ?? '../vera-api/openapi.json';
const output = 'src/shared/lib/api/schema.d.ts';

execFileSync('npx', ['openapi-typescript', input, '-o', output], { stdio: 'inherit' });

// ENXERTO À MÃO: a API ainda não expõe este path (vera#110). Quando existir, apague este bloco,
// o `MANUAL_OPERATION` e o `replace` abaixo, e rode `npm run api:types` de novo.
const MANUAL_PATH = `    // MANUAL (vera#110): path ainda fora do documento da API; é o único enxerto à mão deste arquivo.
    "/billing/invoices/{id}/payment-link": {
        parameters: { query?: never; header?: never; path?: never; cookie?: never };
        /**
         * Payment page of an invoice
         * @description Asked on click and never stored: only an open (issued or overdue) invoice of the signed-in company.
         */
        get: operations["BillingInvoicesController_paymentLink"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
`;
const MANUAL_OPERATION = `    // MANUAL (vera#110): ver o path "/billing/invoices/{id}/payment-link".
    BillingInvoicesController_paymentLink: {
        parameters: { query?: never; header?: never; path: { id: string }; cookie?: never };
        requestBody?: never;
        responses: {
            200: {
                headers: { [name: string]: unknown };
                content: {
                    "application/json": {
                        /** @description Payment page of the invoice */
                        url: string;
                        /** @description Kind of page the url opens */
                        kind: string;
                    };
                };
            };
        };
    };
`;

let source = readFileSync(output, 'utf8');
source = source.replace('export interface paths {\n', `export interface paths {\n${MANUAL_PATH}`);
source = source.replace('export interface operations {\n', `export interface operations {\n${MANUAL_OPERATION}`);
writeFileSync(output, source);
