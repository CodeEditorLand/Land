import { env } from '../../../base/common/process.js';
let product;
const vscodeGlobal = globalThis.vscode;
if (typeof vscodeGlobal !== 'undefined' && typeof vscodeGlobal.context !== 'undefined') {
    const configuration = vscodeGlobal.context.configuration();
    if (configuration) {
        product = configuration.product;
    }
    else {
        throw new Error('Sandbox: unable to resolve product configuration from preload script.');
    }
}
else if (globalThis._VSCODE_PRODUCT_JSON && globalThis._VSCODE_PACKAGE_JSON) {
    product = globalThis._VSCODE_PRODUCT_JSON;
    if (env['VSCODE_DEV']) {
        Object.assign(product, {
            nameShort: `${product.nameShort} Dev`,
            nameLong: `${product.nameLong} Dev`,
            dataFolderName: `${product.dataFolderName}-dev`,
            serverDataFolderName: product.serverDataFolderName ? `${product.serverDataFolderName}-dev` : undefined
        });
    }
    if (!product.version) {
        const pkg = globalThis._VSCODE_PACKAGE_JSON;
        Object.assign(product, {
            version: pkg.version
        });
    }
}
else {
    product = {};
    if (Object.keys(product).length === 0) {
        Object.assign(product, {
            version: '1.95.0-dev',
            nameShort: 'Code - OSS Dev',
            nameLong: 'Code - OSS Dev',
            applicationName: 'code-oss',
            dataFolderName: '.vscode-oss',
            urlProtocol: 'code-oss',
            reportIssueUrl: 'https://github.com/microsoft/vscode/issues/new',
            licenseName: 'MIT',
            licenseUrl: 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt',
            serverLicenseUrl: 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt'
        });
    }
}
export default product;
