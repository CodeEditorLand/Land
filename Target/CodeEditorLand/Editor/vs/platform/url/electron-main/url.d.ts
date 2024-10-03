import { URI } from '../../../base/common/uri.js';
import { IWindowOpenable } from '../../window/common/window.js';
export interface IProtocolUrl {
    uri: URI;
    originalUrl: string;
}
export interface IInitialProtocolUrls {
    readonly urls: IProtocolUrl[];
    readonly openables: IWindowOpenable[];
}
