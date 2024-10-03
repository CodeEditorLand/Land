import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
export const IURITransformerService = createDecorator('IURITransformerService');
export class URITransformerService {
    constructor(delegate) {
        if (!delegate) {
            this.transformIncoming = arg => arg;
            this.transformOutgoing = arg => arg;
            this.transformOutgoingURI = arg => arg;
            this.transformOutgoingScheme = arg => arg;
        }
        else {
            this.transformIncoming = delegate.transformIncoming.bind(delegate);
            this.transformOutgoing = delegate.transformOutgoing.bind(delegate);
            this.transformOutgoingURI = delegate.transformOutgoingURI.bind(delegate);
            this.transformOutgoingScheme = delegate.transformOutgoingScheme.bind(delegate);
        }
    }
}
