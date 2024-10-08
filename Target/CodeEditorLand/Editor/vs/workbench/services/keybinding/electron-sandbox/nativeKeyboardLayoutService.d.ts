import { Disposable } from '../../../../base/common/lifecycle.js';
import { IKeyboardLayoutInfo, IKeyboardMapping } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
import { Event } from '../../../../base/common/event.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
export declare const INativeKeyboardLayoutService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INativeKeyboardLayoutService>;
export interface INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeKeyboardLayout: Event<void>;
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
}
export declare class NativeKeyboardLayoutService extends Disposable implements INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: Event<void>;
    private readonly _keyboardLayoutService;
    private _initPromise;
    private _keyboardMapping;
    private _keyboardLayoutInfo;
    constructor(mainProcessService: IMainProcessService);
    initialize(): Promise<void>;
    private _doInitialize;
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
}
