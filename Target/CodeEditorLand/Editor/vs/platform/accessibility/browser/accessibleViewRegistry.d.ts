import { IDisposable } from '../../../base/common/lifecycle.js';
import { AccessibleViewType, AccessibleContentProvider, ExtensionContentProvider } from './accessibleView.js';
import { ContextKeyExpression } from '../../contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../instantiation/common/instantiation.js';
export interface IAccessibleViewImplentation {
    type: AccessibleViewType;
    priority: number;
    name: string;
    /**
     * @returns the provider or undefined if the view should not be shown
     */
    getProvider: (accessor: ServicesAccessor) => AccessibleContentProvider | ExtensionContentProvider | undefined;
    when?: ContextKeyExpression | undefined;
}
export declare const AccessibleViewRegistry: {
    _implementations: IAccessibleViewImplentation[];
    register(implementation: IAccessibleViewImplentation): IDisposable;
    getImplementations(): IAccessibleViewImplentation[];
};
