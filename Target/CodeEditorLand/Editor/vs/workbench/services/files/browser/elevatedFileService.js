import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IElevatedFileService } from '../common/elevatedFileService.js';
export class BrowserElevatedFileService {
    isSupported(resource) {
        return false;
    }
    async writeFileElevated(resource, value, options) {
        throw new Error('Unsupported');
    }
}
registerSingleton(IElevatedFileService, BrowserElevatedFileService, 1);
