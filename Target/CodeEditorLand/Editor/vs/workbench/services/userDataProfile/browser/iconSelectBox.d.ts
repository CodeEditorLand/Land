import { IIconSelectBoxOptions, IconSelectBox } from '../../../../base/browser/ui/icons/iconSelectBox.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const WorkbenchIconSelectBoxFocusContextKey: RawContextKey<boolean>;
export declare const WorkbenchIconSelectBoxInputFocusContextKey: RawContextKey<boolean>;
export declare const WorkbenchIconSelectBoxInputEmptyContextKey: RawContextKey<boolean>;
export declare class WorkbenchIconSelectBox extends IconSelectBox {
    private static focusedWidget;
    static getFocusedWidget(): WorkbenchIconSelectBox | undefined;
    private readonly contextKeyService;
    private readonly inputFocusContextKey;
    private readonly inputEmptyContextKey;
    constructor(options: IIconSelectBoxOptions, contextKeyService: IContextKeyService);
    focus(): void;
}
