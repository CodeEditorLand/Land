import { IWindowOpenable, IOpenWindowOptions, IOpenEmptyWindowOptions } from '../../../../platform/window/common/window.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare const openWindowCommand: (accessor: ServicesAccessor, toOpen: IWindowOpenable[], options?: IOpenWindowOptions) => void;
export declare const newWindowCommand: (accessor: ServicesAccessor, options?: IOpenEmptyWindowOptions) => void;
