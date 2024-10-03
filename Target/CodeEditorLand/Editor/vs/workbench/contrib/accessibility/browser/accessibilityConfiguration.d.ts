import { IConfigurationNode, IConfigurationPropertySchema } from '../../../../platform/configuration/common/configurationRegistry.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { AccessibilityVoiceSettingId, ISpeechService } from '../../speech/common/speechService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare const accessibilityHelpIsShown: RawContextKey<boolean>;
export declare const accessibleViewIsShown: RawContextKey<boolean>;
export declare const accessibleViewSupportsNavigation: RawContextKey<boolean>;
export declare const accessibleViewVerbosityEnabled: RawContextKey<boolean>;
export declare const accessibleViewGoToSymbolSupported: RawContextKey<boolean>;
export declare const accessibleViewOnLastLine: RawContextKey<boolean>;
export declare const accessibleViewCurrentProviderId: RawContextKey<string>;
export declare const accessibleViewInCodeBlock: RawContextKey<boolean>;
export declare const accessibleViewContainsCodeBlocks: RawContextKey<boolean>;
export declare const accessibleViewHasUnassignedKeybindings: RawContextKey<boolean>;
export declare const accessibleViewHasAssignedKeybindings: RawContextKey<boolean>;
export declare const enum AccessibilityWorkbenchSettingId {
    DimUnfocusedEnabled = "accessibility.dimUnfocused.enabled",
    DimUnfocusedOpacity = "accessibility.dimUnfocused.opacity",
    HideAccessibleView = "accessibility.hideAccessibleView",
    AccessibleViewCloseOnKeyPress = "accessibility.accessibleView.closeOnKeyPress"
}
export declare const enum ViewDimUnfocusedOpacityProperties {
    Default = 0.75,
    Minimum = 0.2,
    Maximum = 1
}
export declare const enum AccessibilityVerbositySettingId {
    Terminal = "accessibility.verbosity.terminal",
    DiffEditor = "accessibility.verbosity.diffEditor",
    Chat = "accessibility.verbosity.panelChat",
    InlineChat = "accessibility.verbosity.inlineChat",
    TerminalChat = "accessibility.verbosity.terminalChat",
    InlineCompletions = "accessibility.verbosity.inlineCompletions",
    KeybindingsEditor = "accessibility.verbosity.keybindingsEditor",
    Notebook = "accessibility.verbosity.notebook",
    Editor = "accessibility.verbosity.editor",
    Hover = "accessibility.verbosity.hover",
    Notification = "accessibility.verbosity.notification",
    EmptyEditorHint = "accessibility.verbosity.emptyEditorHint",
    ReplEditor = "accessibility.verbosity.notebook",
    ReplInputHint = "accessibility.verbosity.replInputHint",
    Comments = "accessibility.verbosity.comments",
    DiffEditorActive = "accessibility.verbosity.diffEditorActive",
    Debug = "accessibility.verbosity.debug",
    Walkthrough = "accessibility.verbosity.walkthrough"
}
export declare const accessibilityConfigurationNodeBase: Readonly<IConfigurationNode>;
export declare const soundFeatureBase: IConfigurationPropertySchema;
export declare const announcementFeatureBase: IConfigurationPropertySchema;
export declare function registerAccessibilityConfiguration(): void;
export { AccessibilityVoiceSettingId };
export declare const SpeechTimeoutDefault = 1200;
export declare class DynamicSpeechAccessibilityConfiguration extends Disposable implements IWorkbenchContribution {
    private readonly speechService;
    private readonly productService;
    static readonly ID = "workbench.contrib.dynamicSpeechAccessibilityConfiguration";
    constructor(speechService: ISpeechService, productService: IProductService);
    private updateConfiguration;
    private getLanguages;
}
