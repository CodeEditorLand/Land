import './bootstrap-server.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { devInjectNodeModuleLookupPath } from './bootstrap-node.js';
import { bootstrapESM } from './bootstrap-esm.js';
import { resolveNLSConfiguration } from './vs/base/node/nls.js';
import { product } from './bootstrap-meta.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const nlsConfiguration = await resolveNLSConfiguration({ userLocale: 'en', osLocale: 'en', commit: product.commit, userDataPath: '', nlsMetadataPath: __dirname });
process.env['VSCODE_NLS_CONFIG'] = JSON.stringify(nlsConfiguration);
if (process.env['VSCODE_DEV']) {
    process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH'] = process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH'] || join(__dirname, '..', 'remote', 'node_modules');
    devInjectNodeModuleLookupPath(process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH']);
}
else {
    delete process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH'];
}
await bootstrapESM();
await import('./vs/server/node/server.cli');
