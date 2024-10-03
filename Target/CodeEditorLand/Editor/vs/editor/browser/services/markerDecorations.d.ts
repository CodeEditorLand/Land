import { IMarkerDecorationsService } from '../../common/services/markerDecorations.js';
import { ICodeEditor } from '../editorBrowser.js';
import { IEditorContribution } from '../../common/editorCommon.js';
export declare class MarkerDecorationsContribution implements IEditorContribution {
    static readonly ID: string;
    constructor(_editor: ICodeEditor, _markerDecorationsService: IMarkerDecorationsService);
    dispose(): void;
}
