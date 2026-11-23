// Gera src/shared/lib/api/schema.d.ts a partir do documento do `npm run openapi:dump` do vera-api.
// Uso: npm run api:types [-- caminho/do/openapi.json]  (padrão: ../vera-api/openapi.json)
import { execFileSync } from 'node:child_process';

const input = process.argv[2] ?? process.env.OPENAPI_JSON ?? '../vera-api/openapi.json';
const output = 'src/shared/lib/api/schema.d.ts';

execFileSync('npx', ['openapi-typescript', input, '-o', output], { stdio: 'inherit' });
