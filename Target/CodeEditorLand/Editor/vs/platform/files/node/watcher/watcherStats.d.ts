import { IUniversalWatchRequest } from '../../common/watcher.js';
import { NodeJSWatcher } from './nodejs/nodejsWatcher.js';
import { ParcelWatcher } from './parcel/parcelWatcher.js';
export declare function computeStats(requests: IUniversalWatchRequest[], failedRecursiveRequests: number, recursiveWatcher: ParcelWatcher, nonRecursiveWatcher: NodeJSWatcher): string;
