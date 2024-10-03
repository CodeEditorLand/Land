import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
export interface IWorkbenchUIElementFactory {
    createResourceLabel?(element: HTMLElement): IResourceLabel;
}
export interface IResourceLabel extends IDisposable {
    setUri(uri: URI | undefined, options?: IResourceLabelOptions): void;
}
export interface IResourceLabelOptions {
    strikethrough?: boolean;
}
