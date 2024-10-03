import { Event } from '../../../base/common/event.js';
export interface IEditorZoom {
    onDidChangeZoomLevel: Event<number>;
    getZoomLevel(): number;
    setZoomLevel(zoomLevel: number): void;
}
export declare const EditorZoom: IEditorZoom;
