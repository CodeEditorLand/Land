import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IHostColorSchemeService } from '../common/hostColorSchemeService.js';
export declare class BrowserHostColorSchemeService extends Disposable implements IHostColorSchemeService {
    readonly _serviceBrand: undefined;
    private readonly _onDidSchemeChangeEvent;
    constructor();
    private registerListeners;
    get onDidChangeColorScheme(): Event<void>;
    get dark(): boolean;
    get highContrast(): boolean;
}
