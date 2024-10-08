/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { InvalidTestItemError } from '../../contrib/testing/common/testItemCollection.js';
const eventPrivateApis = new WeakMap();
export const createPrivateApiFor = (impl, controllerId) => {
    const api = { controllerId };
    eventPrivateApis.set(impl, api);
    return api;
};
/**
 * Gets the private API for a test item implementation. This implementation
 * is a managed object, but we keep a weakmap to avoid exposing any of the
 * internals to extensions.
 */
export const getPrivateApiFor = (impl) => {
    const api = eventPrivateApis.get(impl);
    if (!api) {
        throw new InvalidTestItemError(impl?.id || '<unknown>');
    }
    return api;
};
