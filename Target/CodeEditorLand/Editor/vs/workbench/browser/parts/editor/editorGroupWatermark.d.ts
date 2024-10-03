import { Disposable } from '../../../../base/common/lifecycle.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export declare class EditorGroupWatermark extends Disposable {
    private readonly keybindingService;
    private readonly contextService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly shortcuts;
    private readonly transientDisposables;
    private enabled;
    private workbenchState;
    private keybindingLabels;
    constructor(container: HTMLElement, keybindingService: IKeybindingService, contextService: IWorkspaceContextService, contextKeyService: IContextKeyService, configurationService: IConfigurationService);
    private registerListeners;
    private render;
    private clear;
    dispose(): void;
}
