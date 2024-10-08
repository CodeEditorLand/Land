/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function extHostNamedCustomer(id) {
    return function (ctor) {
        ExtHostCustomersRegistryImpl.INSTANCE.registerNamedCustomer(id, ctor);
    };
}
export function extHostCustomer(ctor) {
    ExtHostCustomersRegistryImpl.INSTANCE.registerCustomer(ctor);
}
export var ExtHostCustomersRegistry;
(function (ExtHostCustomersRegistry) {
    function getNamedCustomers() {
        return ExtHostCustomersRegistryImpl.INSTANCE.getNamedCustomers();
    }
    ExtHostCustomersRegistry.getNamedCustomers = getNamedCustomers;
    function getCustomers() {
        return ExtHostCustomersRegistryImpl.INSTANCE.getCustomers();
    }
    ExtHostCustomersRegistry.getCustomers = getCustomers;
})(ExtHostCustomersRegistry || (ExtHostCustomersRegistry = {}));
class ExtHostCustomersRegistryImpl {
    static { this.INSTANCE = new ExtHostCustomersRegistryImpl(); }
    constructor() {
        this._namedCustomers = [];
        this._customers = [];
    }
    registerNamedCustomer(id, ctor) {
        const entry = [id, ctor];
        this._namedCustomers.push(entry);
    }
    getNamedCustomers() {
        return this._namedCustomers;
    }
    registerCustomer(ctor) {
        this._customers.push(ctor);
    }
    getCustomers() {
        return this._customers;
    }
}
