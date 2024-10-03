import { IObservable } from '../../../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { MergeEditorViewModel } from '../viewModel.js';
import { CodeEditorView } from './codeEditorView.js';
export declare class BaseCodeEditorView extends CodeEditorView {
    constructor(viewModel: IObservable<MergeEditorViewModel | undefined>, instantiationService: IInstantiationService, configurationService: IConfigurationService);
    private readonly decorations;
}
