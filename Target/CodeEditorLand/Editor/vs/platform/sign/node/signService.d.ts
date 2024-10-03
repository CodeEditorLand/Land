import { AbstractSignService, IVsdaValidator } from '../common/abstractSignService.js';
import { ISignService } from '../common/sign.js';
export declare class SignService extends AbstractSignService implements ISignService {
    protected getValidator(): Promise<IVsdaValidator>;
    protected signValue(arg: string): Promise<string>;
    private vsda;
}
