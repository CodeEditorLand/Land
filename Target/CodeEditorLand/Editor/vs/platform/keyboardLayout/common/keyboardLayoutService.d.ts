import { Event } from '../../../base/common/event.js';
import { IKeyboardLayoutInfo, IKeyboardMapping } from './keyboardLayout.js';
export interface IKeyboardLayoutData {
    keyboardLayoutInfo: IKeyboardLayoutInfo;
    keyboardMapping: IKeyboardMapping;
}
export interface INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeKeyboardLayout: Event<IKeyboardLayoutData>;
    getKeyboardLayoutData(): Promise<IKeyboardLayoutData>;
}
