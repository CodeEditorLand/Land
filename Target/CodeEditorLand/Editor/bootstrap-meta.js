import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let productObj = { BUILD_INSERT_PRODUCT_CONFIGURATION: 'BUILD_INSERT_PRODUCT_CONFIGURATION' };
if (productObj['BUILD_INSERT_PRODUCT_CONFIGURATION']) {
    productObj = require('../product.json');
}
let pkgObj = { BUILD_INSERT_PACKAGE_CONFIGURATION: 'BUILD_INSERT_PACKAGE_CONFIGURATION' };
if (pkgObj['BUILD_INSERT_PACKAGE_CONFIGURATION']) {
    pkgObj = require('../package.json');
}
export const product = productObj;
export const pkg = pkgObj;
