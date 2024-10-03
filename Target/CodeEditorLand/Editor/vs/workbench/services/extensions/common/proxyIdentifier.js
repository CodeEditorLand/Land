export class ProxyIdentifier {
    static { this.count = 0; }
    constructor(sid) {
        this._proxyIdentifierBrand = undefined;
        this.sid = sid;
        this.nid = (++ProxyIdentifier.count);
    }
}
const identifiers = [];
export function createProxyIdentifier(identifier) {
    const result = new ProxyIdentifier(identifier);
    identifiers[result.nid] = result;
    return result;
}
export function getStringIdentifierForProxy(nid) {
    return identifiers[nid].sid;
}
export class SerializableObjectWithBuffers {
    constructor(value) {
        this.value = value;
    }
}
