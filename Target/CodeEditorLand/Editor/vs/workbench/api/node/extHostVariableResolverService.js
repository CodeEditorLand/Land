import { homedir } from 'os';
import { ExtHostVariableResolverProviderService } from '../common/extHostVariableResolverService.js';
export class NodeExtHostVariableResolverProviderService extends ExtHostVariableResolverProviderService {
    homeDir() {
        return homedir();
    }
}
