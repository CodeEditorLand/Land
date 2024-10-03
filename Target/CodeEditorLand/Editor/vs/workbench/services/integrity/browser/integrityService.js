import { IIntegrityService } from '../common/integrity.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
export class IntegrityService {
    async isPure() {
        return { isPure: true, proof: [] };
    }
}
registerSingleton(IIntegrityService, IntegrityService, 1);
