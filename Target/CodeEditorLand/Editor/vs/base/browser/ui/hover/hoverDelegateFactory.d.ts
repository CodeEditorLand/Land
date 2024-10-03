import { IHoverDelegate, IScopedHoverDelegate } from './hoverDelegate.js';
export declare function setHoverDelegateFactory(hoverDelegateProvider: ((placement: 'mouse' | 'element', enableInstantHover: boolean) => IScopedHoverDelegate)): void;
export declare function getDefaultHoverDelegate(placement: 'mouse' | 'element'): IHoverDelegate;
export declare function createInstantHoverDelegate(): IScopedHoverDelegate;
