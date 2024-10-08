import { IObservable } from '../../../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { MergeEditorViewModel } from '../viewModel.js';
import { CodeEditorView } from './codeEditorView.js';
export declare class ResultCodeEditorView extends CodeEditorView {
    private readonly _labelService;
    constructor(viewModel: IObservable<MergeEditorViewModel | undefined>, instantiationService: IInstantiationService, _labelService: ILabelService, configurationService: IConfigurationService);
    private readonly decorations;
}
