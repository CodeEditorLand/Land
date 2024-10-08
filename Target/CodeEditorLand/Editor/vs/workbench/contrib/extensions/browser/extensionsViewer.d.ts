import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionsWorkbenchService, IExtension } from '../common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IListService, WorkbenchAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Delegate } from './extensionsList.js';
import { IListStyles } from '../../../../base/browser/ui/list/listWidget.js';
import { IStyleOverride } from '../../../../platform/theme/browser/defaultStyles.js';
export declare class ExtensionsGridView extends Disposable {
    private readonly instantiationService;
    readonly element: HTMLElement;
    private readonly renderer;
    private readonly delegate;
    private readonly disposableStore;
    constructor(parent: HTMLElement, delegate: Delegate, instantiationService: IInstantiationService);
    setExtensions(extensions: IExtension[]): void;
    private renderExtension;
}
interface IExtensionData {
    extension: IExtension;
    hasChildren: boolean;
    getChildren: () => Promise<IExtensionData[] | null>;
    parent: IExtensionData | null;
}
export declare class ExtensionsTree extends WorkbenchAsyncDataTree<IExtensionData, IExtensionData> {
    constructor(input: IExtensionData, container: HTMLElement, overrideStyles: IStyleOverride<IListStyles>, contextKeyService: IContextKeyService, listService: IListService, instantiationService: IInstantiationService, configurationService: IConfigurationService, extensionsWorkdbenchService: IExtensionsWorkbenchService);
}
export declare class ExtensionData implements IExtensionData {
    readonly extension: IExtension;
    readonly parent: IExtensionData | null;
    private readonly getChildrenExtensionIds;
    private readonly childrenExtensionIds;
    private readonly extensionsWorkbenchService;
    constructor(extension: IExtension, parent: IExtensionData | null, getChildrenExtensionIds: (extension: IExtension) => string[], extensionsWorkbenchService: IExtensionsWorkbenchService);
    get hasChildren(): boolean;
    getChildren(): Promise<IExtensionData[] | null>;
}
export declare function getExtensions(extensions: string[], extensionsWorkbenchService: IExtensionsWorkbenchService): Promise<IExtension[]>;
export {};
