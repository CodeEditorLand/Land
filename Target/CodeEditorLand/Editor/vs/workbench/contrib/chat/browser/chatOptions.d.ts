import { Color } from '../../../../base/common/color.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IBracketPairColorizationOptions } from '../../../../editor/common/config/editorOptions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewDescriptorService } from '../../../common/views.js';
export interface IChatConfiguration {
    editor: {
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly lineHeight: number;
        readonly fontWeight: string;
        readonly wordWrap: 'off' | 'on';
    };
}
export interface IChatEditorConfiguration {
    readonly foreground: Color | undefined;
    readonly inputEditor: IChatInputEditorOptions;
    readonly resultEditor: IChatResultEditorOptions;
}
export interface IChatInputEditorOptions {
    readonly backgroundColor: Color | undefined;
    readonly accessibilitySupport: string;
}
export interface IChatResultEditorOptions {
    readonly fontSize: number;
    readonly fontFamily: string | undefined;
    readonly lineHeight: number;
    readonly fontWeight: string;
    readonly backgroundColor: Color | undefined;
    readonly bracketPairColorization: IBracketPairColorizationOptions;
    readonly fontLigatures: boolean | string | undefined;
    readonly wordWrap: 'off' | 'on';
}
export declare class ChatEditorOptions extends Disposable {
    private readonly foreground;
    private readonly inputEditorBackgroundColor;
    private readonly resultEditorBackgroundColor;
    private readonly configurationService;
    private readonly themeService;
    private readonly viewDescriptorService;
    private static readonly lineHeightEm;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../workbench.web.main.internal.js").Event<void>;
    private _config;
    get configuration(): IChatEditorConfiguration;
    private static readonly relevantSettingIds;
    constructor(viewId: string | undefined, foreground: string, inputEditorBackgroundColor: string, resultEditorBackgroundColor: string, configurationService: IConfigurationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService);
    private update;
}
